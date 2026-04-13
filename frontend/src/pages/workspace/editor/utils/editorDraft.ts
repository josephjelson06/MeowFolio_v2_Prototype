import { createEmptyResumeData, DEFAULT_RENDER_OPTIONS, type ResumeDocumentRecord } from 'types/resumeDocument';

const DRAFT_PREFIX = 'meowfolio:editor-draft:';
const LEGACY_DRAFT_PREFIX = 'resumeai:editor-draft:';

function getDraftKey(id: string) {
  return `${DRAFT_PREFIX}${id}`;
}

export function readDraft(id: string) {
  try {
    const raw = localStorage.getItem(getDraftKey(id)) ?? localStorage.getItem(`${LEGACY_DRAFT_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResumeDocumentRecord;
    return parsed.id === id ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDraft(record: ResumeDocumentRecord) {
  localStorage.setItem(getDraftKey(record.id), JSON.stringify(record));
}

export function clearDraft(id: string) {
  localStorage.removeItem(getDraftKey(id));
}

export function editableSnapshot(record: ResumeDocumentRecord) {
  return JSON.stringify({
    content: {
      ...record.content,
      meta: {
        ...record.content.meta,
        createdAt: '',
        updatedAt: '',
      },
    },
    renderOptions: record.renderOptions,
    templateId: record.templateId,
    title: record.title,
  });
}

export function createFallbackRecord(id: string, title: string): ResumeDocumentRecord {
  const now = new Date().toISOString();
  return {
    content: createEmptyResumeData('scratch'),
    createdAt: now,
    id,
    rawText: '',
    renderOptions: { ...DEFAULT_RENDER_OPTIONS },
    source: 'scratch',
    templateId: 'template1',
    title,
    updatedAt: now,
  };
}
