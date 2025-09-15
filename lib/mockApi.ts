import { Draft, ChainEvent, Commitment } from './types';
import { sha256, computeCommitment } from './crypto';
import { useStore } from '../store/useStore';

const MOCK_LATENCY_MIN = 400;
const MOCK_LATENCY_MAX = 800;

const randomLatency = () => Math.random() * (MOCK_LATENCY_MAX - MOCK_LATENCY_MIN) + MOCK_LATENCY_MIN;

export const mockApi = {
  ingest: async (url: string): Promise<Draft> => {
    return new Promise(async (resolve) => {
      // In a real app, this would fetch the URL and parse the doc
      // Here, we'll just create a new draft based on a template
      const pdfResponse = await fetch('/demo/sample.pdf');
      const pdfBlob = await pdfResponse.blob();
      const pdfBuffer = await pdfBlob.arrayBuffer();
      const docSha = await sha256(pdfBuffer);

      const newDocId = `BSE-${new Date().toISOString().split('T')[0]}-NEWCORP`;
      const newDraft: Draft = {
        docId: newDocId,
        title: "New Disclosure (Pending Extraction)",
        company: "New Corp Inc.",
        filing_date: new Date().toISOString().split('T')[0],
        source_url: url,
        doc_sha256: docSha,
        facts: {
          action_type: "board_change",
          fields: {},
          evidence: {},
          risk_tags: [],
        },
        bullets_en: [],
        bullets_local: [],
        generated_by: { model: "V-Extractor-4.1-Turbo", at: new Date().toISOString() },
        status: "draft",
      };
      
      // Simulate AI extraction by populating with demo data after a delay
      setTimeout(async () => {
        const demoFactsResponse = await fetch('/demo/facts.json');
        const demoFacts = await demoFactsResponse.json();
        const demoSummaryResponse = await fetch('/demo/summary.txt');
        const demoSummaryText = await demoSummaryResponse.text();

        newDraft.facts = demoFacts;
        newDraft.bullets_en = demoSummaryText.split('\n').filter(line => line.trim() !== '');
        newDraft.bullets_local = [
          "एआई ने स्थानीय भाषा के बुलेट उत्पन्न किए।",
          "यह एक प्लेसहोल्डर है।",
          "डेमो के लिए, हम इसे पूर्व-परिभाषित पाठ से भरते हैं।",
          "वास्तविक ऐप में, यह एक अनुवाद सेवा होगी।",
          "अंतिम बुलेट।"
        ];
        newDraft.title = "Appointment of Independent Director";
        newDraft.company = "Zestral LLP";

        useStore.getState().addDraft(newDraft);
        resolve(newDraft);
      }, randomLatency() + 500); // Extra delay for "AI"
    });
  },

  commit: async (draft: Draft, approverName: string, approverOrg: string): Promise<ChainEvent> => {
    return new Promise(async (resolve) => {
      const approverMeta = {
        approver_name: approverName,
        approver_org: approverOrg,
        approver_email_domain: approverOrg.toLowerCase().replace(/\s/g, '') + '.com',
        model_version: draft.generated_by.model,
        approved_at: new Date().toISOString(),
      };
      
      const commitment = await computeCommitment({
        docSha: draft.doc_sha256,
        facts: draft.facts,
        summaryEn: draft.bullets_en.join('\n'),
        approverMeta: approverMeta
      });

      const approverMetaHash = await sha256(JSON.stringify(approverMeta));

      const newEvent: ChainEvent = {
        docId: draft.docId,
        commitment: commitment,
        approverMetaHash: approverMetaHash,
        publisherId: '0x1234...abcd',
        network: 'PolygonTest',
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` as Commitment,
        ts: new Date().toISOString(),
      };
      
      setTimeout(() => {
        useStore.getState().addEvent(newEvent);
        useStore.getState().updateDraftStatus(draft.docId, 'published');
        resolve(newEvent);
      }, randomLatency());
    });
  },
};