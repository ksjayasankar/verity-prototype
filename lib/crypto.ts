import { keccak256 } from 'js-sha3';
import { ApprovalMeta, Facts } from './types';

// Helper to convert ArrayBuffer to a hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Creates a canonical JSON string by sorting keys recursively.
 * @param obj The object to stringify.
 * @returns A stable JSON string.
 */
export function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(item => canonicalJson(item)).join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const keyValuePairs = sortedKeys.map(key => {
    return `"${key}":${canonicalJson(obj[key])}`;
  });

  return `{${keyValuePairs.join(',')}}`;
}

/**
 * Computes the SHA-256 hash of a string or ArrayBuffer.
 * @param data The input data (string or ArrayBuffer).
 * @returns The hex-encoded SHA-256 hash.
 */
export async function sha256(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data);
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

interface ComputeCommitmentParams {
  docSha: string;
  facts: Facts;
  summaryEn: string;
  approverMeta: ApprovalMeta;
}

/**
 * Computes the final Verity commitment hash.
 * commitment = keccak256(hex(doc_sha256) || sha256(facts_json) || sha256(summary_en) || sha256(approver_meta))
 * @returns The keccak256 commitment as a hex string with "0x" prefix.
 */
export async function computeCommitment({ docSha, facts, summaryEn, approverMeta }: ComputeCommitmentParams): Promise<`0x${string}`> {
  const canonicalFacts = canonicalJson(facts);
  const canonicalMeta = canonicalJson(approverMeta);

  const [factsHash, summaryHash, metaHash] = await Promise.all([
    sha256(canonicalFacts),
    sha256(summaryEn),
    sha256(canonicalMeta),
  ]);

  // Concatenate the hex strings of the hashes (without '0x' prefixes)
  const concatenatedHashes = `${docSha}${factsHash}${summaryHash}${metaHash}`;
  
  // Compute the final keccak256 hash
  const commitment = keccak256(concatenatedHashes);
  
  return `0x${commitment}`;
}