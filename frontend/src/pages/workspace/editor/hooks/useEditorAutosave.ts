import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { clearDraft, editableSnapshot, writeDraft } from 'pages/workspace/editor/utils/editorDraft';
import { resumeService } from 'services/resumeService';
import type { ResumeDocumentRecord } from 'types/resumeDocument';

export function useEditorAutosave({
  activeResumeId,
  record,
  setRecord,
}: {
  activeResumeId: string | null;
  record: ResumeDocumentRecord | null;
  setRecord: Dispatch<SetStateAction<ResumeDocumentRecord | null>>;
}) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'recovered'>('idle');
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedSnapshotRef = useRef('');
  const recordRef = useRef<ResumeDocumentRecord | null>(null);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    if (!record || !activeResumeId) return;
    const snapshot = editableSnapshot(record);
    if (!snapshot || snapshot === lastSavedSnapshotRef.current) return;

    writeDraft(record);

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    setSaveState(current => (current === 'recovered' ? current : 'saving'));
    saveTimeoutRef.current = window.setTimeout(async () => {
      const latest = recordRef.current;
      if (!latest) return;

      try {
        const saved = await resumeService.saveRecord(latest.id, {
          content: latest.content,
          renderOptions: latest.renderOptions,
          templateId: latest.templateId,
          title: latest.title,
          rawText: latest.rawText,
        });
        lastSavedSnapshotRef.current = editableSnapshot(latest);
        clearDraft(latest.id);
        if (saved) {
          setRecord(current =>
            current && current.id === latest.id
              ? {
                  ...current,
                  ...saved,
                }
              : current,
          );
        }
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeResumeId, record, setRecord]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  async function persistNow() {
    const current = recordRef.current;
    if (!current) return null;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const snapshot = editableSnapshot(current);
    if (!snapshot || snapshot === lastSavedSnapshotRef.current) {
      return current;
    }

    try {
      setSaveState('saving');
      writeDraft(current);
      const saved = await resumeService.saveRecord(current.id, {
        content: current.content,
        renderOptions: current.renderOptions,
        templateId: current.templateId,
        title: current.title,
        rawText: current.rawText,
      });
      lastSavedSnapshotRef.current = editableSnapshot(current);
      clearDraft(current.id);
      if (saved) {
        setRecord(previous =>
          previous && previous.id === current.id
            ? {
                ...previous,
                ...saved,
              }
            : previous,
        );
      }
      setSaveState('saved');
      return saved ?? current;
    } catch {
      setSaveState('error');
      return current;
    }
  }

  return {
    persistNow,
    saveState,
    setSaveState,
  };
}
