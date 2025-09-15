import { create } from 'zustand';
import { Draft, ChainEvent, Settings } from '../lib/types';
import initialDrafts from '../data/drafts.json';
import initialEvents from '../public/events.json';

interface VerityState {
  drafts: Draft[];
  events: ChainEvent[];
  settings: Settings;
  isInitialized: boolean;
  initialize: () => void;
  getDraft: (docId: string) => Draft | undefined;
  getEventsForDoc: (docId: string) => ChainEvent[];
  addDraft: (draft: Draft) => void;
  updateDraft: (docId: string, updates: Partial<Draft>) => void;
  updateDraftStatus: (docId: string, status: Draft['status']) => void;
  addEvent: (event: ChainEvent) => void;
}

export const useStore = create<VerityState>((set, get) => ({
  drafts: [],
  events: [],
  settings: {
    modelName: 'V-Extractor-4.1-Turbo',
    dataCutoff: 'June 2024',
    network: 'Polygon Amoy Testnet',
    contractAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    disclosureText: 'AI used; human-approved; hashes on-chain'
  },
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    // In a real app, this would be an API call. Here we load from JSON.
    set({ drafts: initialDrafts as Draft[], events: initialEvents as ChainEvent[], isInitialized: true });
  },

  getDraft: (docId: string) => {
    return get().drafts.find(d => d.docId === docId);
  },
  
  getEventsForDoc: (docId: string) => {
    const baseId = docId.replace(/-V\d+$/, ''); // e.g., "DOC-V2" -> "DOC"
    return get().events.filter(e => e.docId.startsWith(baseId));
  },

  addDraft: (draft: Draft) => {
    set(state => ({ drafts: [...state.drafts, draft] }));
  },

  updateDraft: (docId: string, updates: Partial<Draft>) => {
    set(state => ({
      drafts: state.drafts.map(d => d.docId === docId ? { ...d, ...updates } : d)
    }));
  },

  updateDraftStatus: (docId: string, status: Draft['status']) => {
    set(state => ({
      drafts: state.drafts.map(d => d.docId === docId ? { ...d, status } : d)
    }));
  },

  addEvent: (event: ChainEvent) => {
    set(state => ({ events: [...state.events, event] }));
  },
}));