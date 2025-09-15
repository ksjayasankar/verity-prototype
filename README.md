# Verity - Frontend Prototype

A frontend-only prototype for "Verity", a tool that converts official market disclosures into short, evidence-linked briefs that are cryptographically verifiable on-chain.

This project was built as a demo-ready prototype with no backend. All operations, including cryptographic hashing and mock "on-chain" events, are handled entirely on the client-side.

## Key Features

- **S1: Ingest:** Add a new disclosure via a mock URL.
- **S2: AI Draft:** View AI-extracted facts and a generated summary.
- **S3: Review & Approve:** Validate the brief, provide approver details, and "commit" the data.
- **S4: Public Brief:** View the final, published brief with evidence popovers and integrity badge.
- **S5: Client-Side Verification:** Verify the integrity of a brief by dropping the source artifacts, which are hashed locally in the browser.
- **S6: Version Diffing:** Compare v1 and v2 of a brief to see what changed.
- **S7: Settings:** View mock application settings and embeddable snippets.
- **Fake Block Explorer:** A mock explorer page to view the details of a "committed" event.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS v4 (CSS-first configuration)
- **State Management:** Zustand
- **Cryptography:** Web Crypto API (for SHA-256), `js-sha3` (for keccak256)
- **Tooling:** TypeScript, PostCSS, Lucide Icons

---

## Getting Started

Follow these instructions to get the project running on your local machine for development and demonstration purposes.

### Prerequisites

You need to have Node.js installed on your machine.
- **Node.js** (v18.x or newer is recommended)

You can check your Node.js version by running:
```bash
node -v
```

### Installation & Setup

1. **Clone the repository:** If you have the project files already, you can skip this step. Otherwise, clone the repository to your local machine.

```bash
git clone <your-repository-url>
cd verity-prototype
```

2. **Install dependencies:** This command will install all the necessary packages defined in `package.json`.

```bash
npm install
```

3. **Run the development server:** This command starts the Next.js development server, typically on port 3000.

```bash
npm run dev
```

4. **Open the application:** Open your web browser and navigate to http://localhost:3000. You should see the Verity "Ingest" page.