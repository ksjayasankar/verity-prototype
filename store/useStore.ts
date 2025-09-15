// /store/useStore.ts
import { create } from 'zustand';
import { Draft, ChainEvent, Settings } from '../lib/types';
import initialDrafts from '../data/drafts.json';
import initialEvents from '../data/events.json'; // <-- move file to /data

interface VerityState {
  drafts: Draft[];
  events: ChainEvent[];
  settings: Settings;
  isInitialized: boolean;
  initialize: () => void;
  getDraft: (docId: string) => Draft | undefined;
  getEventsForDoc: (docId: string) => ChainEvent[];
  getEventByDocId: (docId: string) => ChainEvent | undefined;
  addDraft: (draft: Draft) => void;
  updateDraft: (docId: string, updates: Partial<Draft>) => void;
  updateDraftStatus: (docId: string, status: Draft['status']) => void;
  addEvent: (event: ChainEvent) => void;
  createNewVersion: (docId: string) => string | null;
}

export const useStore = create<VerityState>((set, get) => ({
  drafts: [],
  events: [],
  settings: {
    modelName: 'V-Extractor-4.1-Turbo',
    dataCutoff: 'June 2024',
    network: 'Polygon Amoy Testnet',
    contractAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    disclosureText: 'AI used; human-approved; hashes on-chain',
  },
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    set({
      drafts: initialDrafts as Draft[],
      events: (initialEvents as ChainEvent[]).sort(
        (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
      ),
      isInitialized: true,
    });
  },

  getDraft: (docId: string) => get().drafts.find(d => d.docId === docId),

  getEventsForDoc: (docId: string) => {
    const baseId = docId.replace(/-V\d+$/, '');
    return get().events.filter(e => e.docId.startsWith(baseId));
  },

  getEventByDocId: (docId: string) => get().events.find(e => e.docId === docId),

  addDraft: (draft: Draft) => set(state => ({ drafts: [...state.drafts, draft] })),

  updateDraft: (docId, updates) =>
    set(state => ({
      drafts: state.drafts.map(d => (d.docId === docId ? { ...d, ...updates } : d)),
    })),

  updateDraftStatus: (docId, status) =>
    set(state => ({
      drafts: state.drafts.map(d => (d.docId === docId ? { ...d, status } : d)),
    })),

  addEvent: (event: ChainEvent) =>
    set(state => ({ events: [event, ...state.events] })),

  createNewVersion: (docId: string): string | null => {
    const originalDraft = get().drafts.find(d => d.docId === docId);
    if (!originalDraft) return null;

    const baseId = docId.replace(/-V\d+$/, '');
    const existingVersions = get().drafts.filter(d => d.docId.startsWith(baseId));
    const nextVersionNumber = existingVersions.length + 1;
    const newDocId = `${baseId}-V${nextVersionNumber}`;

    const newDraft: Draft = {
      ...JSON.parse(JSON.stringify(originalDraft)),
      docId: newDocId,
      title: `REVISED: ${originalDraft.title}`.replace('REVISED: REVISED: ', 'REVISED: '),
      status: 'review',
      generated_by: {
        ...originalDraft.generated_by,
        at: new Date().toISOString(),
      },
    };

    set(state => ({ drafts: [...state.drafts, newDraft] }));
    return newDocId;
  },
}));
