import { resumeLibrarySeed } from 'mocks/resumeLibrary';
import type { ResumeRecord } from 'types/resume';

let resumeLibrary = structuredClone(resumeLibrarySeed);

export const resumeService = {
  list() {
    return structuredClone(resumeLibrary);
  },
  rename(id: string, nextName: string) {
    resumeLibrary = resumeLibrary.map(item => item.id === id ? { ...item, name: nextName } : item);
    return structuredClone(resumeLibrary);
  },
  remove(id: string) {
    resumeLibrary = resumeLibrary.filter(item => item.id !== id);
    return structuredClone(resumeLibrary);
  },
  getById(id: string): ResumeRecord | undefined {
    return structuredClone(resumeLibrary.find(item => item.id === id));
  },
};
