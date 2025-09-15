# Verity Demo Script (2-3 Minutes)

This script walks through the core user flows of the Verity prototype.

### Scene 1: Ingest a New Disclosure (S1 -> S2)

1.  **Start on the Ingest page (`/ingest`).**
2.  The "URL" option is selected by default.
3.  Click the **"Extract"** button.
4.  Observe the loading skeleton and the "Parsing..." toast message.
5.  After a short delay, you'll be redirected to the **AI Draft page (`/draft/[docId]`)**. A "Parsing complete" toast appears.

### Scene 2: View AI Draft (S2)

1.  **You are on the AI Draft page.**
2.  Point out the two panes:
    *   **Left:** The read-only **Facts JSON** extracted by the AI.
    *   **Right:** The editable 5-bullet **Summary**.
3.  Hover over an **evidence chip**, like `[p.1]`, on the right. A popover appears showing the exact quote from the source document.
4.  Click **"Continue to Review"**.

### Scene 3: Review and Commit (S3)

1.  **You are on the Review & Approve page.**
2.  Show the validation checklist on the left (all green).
3.  Point out the **Language Toggle** tabs ("English" and "Hindi"). Click between them to show the different summaries.
4.  Enter an approver name (e.g., "Nisha V") and organization (e.g., "Verity Inc.").
5.  The **"Approve & Commit"** button is now enabled. Click it.
6.  A **confirmation modal** appears. Explain that it summarizes exactly what will be cryptographically signed (hashed).
7.  Click **"Confirm & Commit"**.
8.  A "Commit sent..." toast appears, followed by "Commit confirmed!".
9.  You are redirected to the **Brief page (`/brief/[docId]`)**.

### Scene 4: The Public Investor Brief (S4)

1.  **You are on the public Brief page.**
2.  Show the clean, 5-bullet summary.
3.  Again, hover over an **evidence chip** to show the popover with the quote.
4.  Point out the **Integrity Badge** on the right. It shows a truncated commitment hash and a "Verified" status.
5.  Click the **"View on block explorer"** link. This opens the fake explorer page in a new tab, showing the pretty-printed event JSON.
6.  Close the explorer tab.
7.  Click the **"Verify"** button.

### Scene 5: Client-Side Verification (S5)

1.  **You are on the Verify page (`/verify/[docId]`).**
2.  Explain that this process runs entirely in the user's browser, with no file uploads.
3.  The page prompts the user to drop three artifacts. For the demo, we'll click the button to load the sample files.
4.  Click **"Load Demo Artifacts"**.
5.  The three drop zones will populate, and the verification process runs automatically.
6.  The result appears: **✅ Match Found**.
7.  Point out that the recomputed hash matches the on-chain commitment.

### Scene 6: Versioning (Optional) (S6)

1.  Navigate to `/versions/NSE-2025-08-12-RELIANCE`.
2.  Show the timeline view with v1 and v2.
3.  Point out the **"Changed Fields"** section, which highlights what changed in the Facts JSON (e.g., `dividend_per_share`).
4.  Show the prose diff below.
5.  Each version has its own commitment hash and a link to its brief.

This completes the core demo flow, showcasing the journey from raw disclosure to a verifiable, trustworthy brief.