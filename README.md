# Prabisha Content Intelligence & Growth Platform (PCIGP)
**Version 1.0 (MVP Baseline)**  
*Engineered for Prabisha Consulting (UK & India)*

PCIGP is an AI-powered marketing operations platform that moves beyond generic text generation. Its key differentiator is a **shared intelligence layer** containing Ideal Customer Profiles (ICPs), brand/product facts, evidence-backed claims, compliance rule packs (UK ASA/CAP, ICO PECR & India ASCI, DPDP), and multi-channel campaign asset generation with strict human-in-the-loop review gates.

---

## Key Capabilities Implemented

### 1. ICP & Persona Management (`ICP-01` to `ICP-04`, `src/app/icp/`)
- **ICP Creation & Lineage (`ICP-01`)**: Full attributes (industry, subindustry, geographies, company size, revenue band, business model, maturity, buying capacity, buyer role).
- **Provenance Cloning**: 1-click cloning preserving lineage via `clonedFromId` with automated version incrementing.
- **Pain Point & Buying Trigger Mapping (`ICP-02`)**: Connects qualitative pains and objections to downstream briefs.
- **Explainable Fit Scoring Engine (`ICP-04`)**: Configurable heuristic fit scoring exposing component weights (Industry 25%, Company Scale 20%, Pain Alignment 30%, Buying Capacity 25%), calculating Tier 1/2/3 classification and strategic messaging recommendations.

### 2. Campaign Brief Builder & Templates (`CAM-01`, `CAM-02`, `src/app/campaigns/`)
- **Interactive Brief Builder**: Configure objective, ICP persona, market (`UK` / `INDIA`), funnel stage, offer catalogue mapping, tone, and target CTA.
- **Reusable Brief Templates**: Save any campaign brief as a template (`POST /api/v1/campaigns/templates`) and instantiate live campaigns from templates.
- **Campaign Cloning**: 1-click campaign cloning with complete configuration preservation.

### 3. Multi-Dimensional Filter Engine (PRD Section 6, `src/lib/filters/`)
- Filter across Market Jurisdiction, Funnel Stage, Asset Channel, and Lifecycle Status.
- One-click workflow presets ("UK Mid/Bottom Funnel", "India Awareness", "Clear All").

### 4. Historical Content Ingestion & Semantic Search (`BR-05`, `BR-06`, `src/lib/content/`)
- **Multi-Format Ingestion (`BR-05`)**: Import Markdown documents, CSV data, and URL web text into a central workspace archive.
- **SHA256 Checksum De-duplication**: Prevents duplicate document imports automatically.
- **Semantic & Keyword Knowledge Search (`BR-06`)**: Searches approved knowledge and past assets, returning relevance-ranked matches and highlighted contextual excerpts.

### 5. Near-Duplicate Detection Engine (`GEN-06`, `src/lib/content/`)
- Token and n-gram Jaccard shingling calculates similarity score (0.0 to 1.0) against prior assets and historical documents.
- Surfaces warnings (`REWRITE_RECOMMENDED`, `DOCUMENTED_EXCEPTION_REQUIRED`) when content similarity exceeds 65%.

### 6. On-Page SEO & Content Quality Audit Engine (`SEO-01`, `SEO-02`, `src/lib/seo/`)
- Comprehensive checks: Title length, meta description length, heading hierarchy, URL slug formatting, Flesch Reading Ease readability scoring, and keyword density/stuffing detection.
- Includes mandatory PRD disclaimer: no ranking factor guarantee.

### 7. Grounded RAG Retrieval Service (`GEN-04`, `GEN-05`, `src/lib/ai/`)
- Automatic context assembly retrieving relevant approved claims, supporting evidence records, and historical references for every campaign generation prompt.

### 8. Publishing Calendar & Distribution State Machine (`PUB-01`, `PUB-02`, `src/lib/distribution/`)
- **Server-Side State Machine Guard**: Strict transition validation ensuring only `APPROVED` assets can be scheduled or published.
- **Copy-Ready Distribution Packages (`PUB-02`)**: Generates structured, copy-ready packages embedding verified UTM tracking links and statutory jurisdiction disclaimers (UK ASA/CAP & India ASCI).
- **Interactive Schedule Timeline**: Week and month view with channel, status, and campaign filters.

### 9. Standardized UTM Parameter Builder (`PUB-03`, `src/lib/distribution/`)
- Token sanitization enforcing lowercase underscore conventions across `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content`.
- Destination domain validation against approved brand registries (`prabisha.com`, `prabisha.co.uk`).

### 10. Performance Reporting & RFC-4180 CSV Export (`PUB-05`, `PUB-06`, `src/lib/analytics/`)
- One-click CSV export streaming complete production history, approval statuses, publication dates, and attribution metrics.
- Compliance with PRD requirement `PUB-05`: Un-synced metrics are explicitly formatted as `UNAVAILABLE` rather than misleading zeros.
- Audited export actions in the immutable governance ledger.

### 11. Model-Agnostic AI Gateway (`src/lib/ai/`)
   - Clean provider-agnostic interface (`generateContent`, `embedDocuments`, `classifyContent`, `evaluateAsset`).
   - Integrated adapters for **Google Gemini (1.5 Pro / Flash)**, **OpenAI (GPT-4o / GPT-4o-mini)**, **LiteLLM Proxy**, and **Deterministic Mock Provider**.
   - Automatic circuit-breaker fallback when primary providers are unavailable or throttled.
   - Built-in `AIUsageLedger` logging tokens, latency, cost estimation, and audit metadata.

2. **Grounded Knowledge & Claim Registry (`src/lib/compliance/`, `src/app/knowledge/`)**
   - Brand Profile & approved voice rules (tone, vocabulary dos & don'ts).
   - Product & Service Catalog with explicit capability and limitation boundaries.
   - Evidence Library linking case studies, testimonials, and ISO certifications.
   - Claim Registry ensuring every commercial claim has documentary proof.

3. **UK & India Compliance Rules Engine (`src/lib/compliance/`)**
   - **United Kingdom:** ASA/CAP Rule 3.7 (Substantiation), Rule 3.1 (No Fake Scarcity / Deceptive Urgency), and ICO PECR direct marketing opt-out disclosures.
   - **India:** ASCI Chapter I (Honest representations) and DPDP Act consent/purpose specification.
   - Automated content scanner flags unsupported statistics, prohibited patterns, and missing disclaimers.

4. **Multi-Channel Campaign Studio (`src/app/campaigns/`)**
   - Seeded with **Appendix A: UK SME AI Automation — Weekly Lead Generation**.
   - One-click weekly content-pack generator (LinkedIn posts, Long-Form Blog briefs, Email newsletters).
   - Asset lifecycle state machine (`Draft` → `Validating` → `Needs Review` → `Approved` → `Published`).
   - Human review & editorial gate with server-enforced **Separation of Duties** (content creators cannot approve their own assets).

5. **Executive & Governance Dashboard (`src/app/`)**
   - Real-time KPI cards: Active campaigns, substantiated claims, pending compliance reviews, and generated variants.
   - Live audit trail conforming to OWASP ASVS logging standards.
   - Model routing policy inspector and token spend telemetry.

---

## Getting Started

### 1. Requirements
- Node.js 20+ (v24 tested)
- pnpm or npm

### 2. Environment Variables (`.env`)
```bash
DATABASE_URL="file:./dev.db" # SQLite for instant local dev, or postgresql://... for production
AI_DEFAULT_PROVIDER="mock"   # "mock", "gemini", "openai", or "litellm"
GEMINI_API_KEY=""
OPENAI_API_KEY=""
LITELLM_API_BASE="http://localhost:4000/v1"
```

### 3. Run Database Migrations & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Automated Tests
```bash
# Runs RBAC, Compliance Engine, AI Gateway, and Database integrity tests
npx tsx tests/run-all.ts

# Runs End-to-End API workflow test
npx tsx tests/e2e-smoke.ts
```

### 5. Launch Development Server
```bash
pnpm dev
# Or
npx next dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Directory Architecture
```
pcigp/
├── prisma/
│   ├── schema.prisma             # 18 relational entities matching PRD Section 9
│   └── seed.ts                   # Realistic Prabisha UK/India seed dataset
├── src/
│   ├── app/
│   │   ├── api/v1/               # Versioned REST APIs
│   │   │   ├── campaigns/        # Campaign brief & content generation endpoints
│   │   │   ├── assets/           # Review gates & lifecycle transitions
│   │   │   └── admin/ai/         # AI gateway policy configuration & telemetry
│   │   ├── campaigns/            # Campaign Studio & channel variant view
│   │   ├── knowledge/            # Claims registry & evidence library view
│   │   ├── compliance/           # UK/India compliance rules & audit logs
│   │   ├── settings/             # AI gateway policies & spend ledger
│   │   ├── layout.tsx            # Navigation header & persistent shell
│   │   └── page.tsx              # Executive operations dashboard
│   ├── lib/
│   │   ├── ai/                   # Model-agnostic AI Gateway & adapters
│   │   ├── compliance/           # UK (ASA/CAP) & India (ASCI) rules engine
│   │   ├── db/                   # Prisma database client
│   │   └── rbac/                 # Server-side roles & permissions
│   └── types/                    # Core TypeScript domain contracts
└── tests/
    ├── run-all.ts                # Unit & regression test suite (16 tests)
    └── e2e-smoke.ts              # End-to-end API workflow verification
```

