import { useEffect, useMemo, useState } from 'react';
import { createFallbackRecord, readDraft } from 'pages/workspace/editor/utils/editorDraft';
import { countForSection, sectionList } from 'pages/workspace/editor/utils/editorSections';
import { toolbarFromRenderOptions } from 'pages/workspace/editor/utils/editorToolbar';
import { resumeService } from 'services/resumeService';
import type { EditorSectionItem, ToolbarValues } from 'pages/workspace/editor/types';
import type { ResumeDocumentRecord } from 'types/resumeDocument';

export function useEditorRecord({
  resumeIdFromQuery,
  activeSection,
  pageBySection,
  onToolbarValuesChange,
}: {
  resumeIdFromQuery: string | null;
  activeSection: string;
  pageBySection: Record<string, number>;
  onToolbarValuesChange: (values: ToolbarValues) => void;
}) {
  const [resumeOptions, setResumeOptions] = useState<Awaited<ReturnType<typeof resumeService.list>>>([]);
  const [record, setRecord] = useState<ResumeDocumentRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeResumeId = useMemo(
    () => resumeIdFromQuery ?? resumeService.getActiveId() ?? resumeOptions[0]?.id ?? null,
    [resumeIdFromQuery, resumeOptions],
  );

  const sections = useMemo<EditorSectionItem[]>(() => {
    if (!record) return sectionList(null);
    return sectionList(record.content, record.renderOptions.sectionOrder);
  }, [record]);

  const totalPages = useMemo(() => (record ? countForSection(record.content, activeSection) : 1), [record, activeSection]);
  const page = pageBySection[activeSection] ?? 1;
  const resumeName = record?.title ?? resumeOptions.find(option => option.id === activeResumeId)?.name ?? 'Resume Editor';

  useEffect(() => {
    void resumeService.list().then(setResumeOptions);
  }, []);

  useEffect(() => {
    if (!activeResumeId) {
      setRecord(null);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const saved = await resumeService.getRecord(activeResumeId);
        if (cancelled) return;

        const nextRecord = readDraft(saved.id) ?? saved;
        onToolbarValuesChange(toolbarFromRenderOptions(nextRecord.renderOptions));
        if (!cancelled) {
          setRecord(nextRecord);
          setLoadError(null);
        }
      } catch {
        if (cancelled) return;
        const fallback = createFallbackRecord(activeResumeId, resumeOptions.find(option => option.id === activeResumeId)?.name ?? 'Resume Editor');
        const nextRecord = readDraft(activeResumeId) ?? fallback;
        onToolbarValuesChange(toolbarFromRenderOptions(nextRecord.renderOptions));
        setRecord(nextRecord);
        setLoadError('Could not load the saved record, so the editor is using a local fallback.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeResumeId, onToolbarValuesChange]);

  return {
    activeResumeId,
    loadError,
    page,
    record,
    resumeName,
    resumeOptions,
    sections,
    setLoadError,
    setRecord,
    setResumeOptions,
    totalPages,
  };
}
