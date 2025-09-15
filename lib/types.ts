export type DocId = string;
export type Commitment = `0x${string}`;

export interface Facts {
  action_type: "dividend" | "pledge" | "board_change" | "litigation" | "buyback";
  fields: Record<string, string | number | null>;
  evidence: Record<string, { page: number; quote: string }>;
  risk_tags: string[];
}
export interface Draft {
  docId: DocId;
  title: string;
  company: string;
  filing_date: string;
  source_url: string;
  doc_sha256: string;
  facts: Facts;
  bullets_en: string[];
  bullets_local: string[];
  generated_by: { model: string; at: string };
  status: "draft" | "review" | "approved" | "published";
}
export interface ApprovalMeta {
  approver_name: string;
  approver_org: string;
  approver_email_domain: string;
  model_version: string;
  approved_at: string; // ISO
}
export interface ChainEvent {
  docId: DocId;
  commitment: Commitment;
  approverMetaHash: string;
  publisherId: string;
  network: "PolygonTest";
  txHash: Commitment;
  ts: string;
}

export interface Settings {
  modelName: string;
  dataCutoff: string;
  network: string;
  contractAddress: string;
  disclosureText: string;
}