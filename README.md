# Multi-Specialty Local-First ICD-11 Coding Pipeline

A two-pass clinical entity extraction and post-coordination pipeline powered by **TypeSafe System One Jev AI** and a **local WHO ICD-API** instance (MMS 2026-01).

---

## Architecture & Workflow

```
                        ┌────────────────────────┐
                        │   Clinical Note Input  │
                        └───────────┬────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │  Pass 1: Universal Router    │
                    │  (ROUTER_SCHEMA)             │
                    └───────────────┬──────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │  Endocrinology   │   │   Pulmonology    │   │    Cardiology    │
   │   (Score: 0.05)  │   │   (Score: 0.98)  │   │   (Score: 0.22)  │ etc...
   └──────────────────┘   └─────────┬────────┘   └──────────────────┘
                                    │
                                    │ Trigger Active (> 0.70)
                                    ▼
                    ┌──────────────────────────────┐
                    │  Pass 2: Specialty Call      │
                    │  (PULMONOLOGY_SCHEMA)        │
                    └───────────────┬──────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │  Extracted Entities:         │
                    │  - condition: Asthma         │
                    │  - pattern: Acute attack     │
                    │  - severity: Severe          │
                    │  - temporality: Acute        │
                    └───────────────┬──────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │  Local ICD-API Search        │
                    │  Query candidates:           │
                    │  ["Asthma severe", "Asthma"] │
                    └───────────────┬──────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │  Pass 3: Post-Coordination   │
                    │  Stem: CA23 (Asthma)         │
                    │  Extensions:                 │
                    │  - &XS25 (Severe)            │
                    │  - &XT5R (Acute)             │
                    │  Output: CA23&XS25&XT5R      │
                    └──────────────────────────────┘
```

---

## Features

- **Pass 1: Universal Router**: Dynamically assembled schema classifying clinical notes across medical specialties with high-speed confidence evaluation (`noul` questions).
- **Pass 2: Specialty Schemas (`lib/schemas/`)**:
  - `endocrinology.ts`: Type 1/2 Diabetes, thyroid conditions, Cushing syndrome, adrenal insufficiency.
  - `woundcare.ts`: Diabetic foot ulcers, pressure injuries, venous/arterial ulcers, burns, laterality, and anatomical sites.
  - `cardiology.ts`: Heart failure, acute myocardial infarction, arrhythmias, angina, decompensation patterns.
  - `respiratory.ts` / `pulmonilogy.ts`: Asthma, COPD, pneumonia, acute attacks, status asthmaticus.
  - `nephrology.ts`: Chronic kidney disease (Stages 1–5), acute kidney injury, nephrotic syndromes.
  - `gastroenterology.ts`: Crohn disease, ulcerative colitis, GERD, peptic ulcers, acute pancreatitis.
  - `registry.ts`: Central router configuration and schema loader.
- **Pass 3: ICD-11 Post-Coordination Module (`lib/icd/extensions.ts`)**:
  - Automatically maps extracted severity, temporality, laterality, and anatomical site entities to Chapter X Extension Codes (`&` delimiter) and cluster combinations (`/` delimiter).
- **Local-First WHO ICD-API Client (`lib/icd/client.ts`)**:
  - Multi-tier query builder that searches local offline ICD-API on port `8382` with intelligent fallback to guarantee high recall.
- **Interactive UI (`app/page.tsx`)**:
  - Quick clinical note presets for all specialties.
  - Real-time gauge of router specialty scores.
  - Candidate table highlighting base codes, extension badges, scores, and matched synonyms.

---

## Project Structure

```
my-icd11-app-v2/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts         # Main orchestration handler (Pass 1 -> Pass 2 -> Pass 3)
│   ├── layout.tsx
│   └── page.tsx                 # Interactive UI with router & candidate tables
├── lib/
│   ├── schemas/
│   │   ├── registry.ts          # Central Pass 1 router & active schema loader
│   │   ├── endocrinology.ts     # Endocrine & Diabetes schema
│   │   ├── woundcare.ts         # Wound care, ulcers & topography schema
│   │   ├── cardiology.ts        # Cardiovascular conditions & patterns schema
│   │   ├── respiratory.ts       # Pulmonary conditions & exacerbations schema
│   │   ├── pulmonilogy.ts       # Pulmonology alias export
│   │   ├── nephrology.ts        # Renal conditions & staging schema
│   │   └── gastroenterology.ts  # GI conditions & mucosal sites schema
│   ├── icd/
│   │   ├── client.ts            # Local WHO ICD-API HTTP client & query candidate generator
│   │   └── extensions.ts        # Chapter X extension code mapper & post-coordination builder
│   └── types.ts                 # Shared TypeScript interfaces
├── scripts/
│   └── test-pipeline.ts         # 10 complex clinical test cases with syntax assertions
├── .env.local                   # Environment variables (API keys & endpoints)
├── package.json
└── tsconfig.json
```

---

## Environment Setup

Create or verify `.env.local` in the project root:

```env
TYPESAFE_API_KEY=your_typesafe_api_key_here
NEXT_PUBLIC_LOCAL_ICD_API_URL=http://localhost:8382
```

Ensure your local WHO ICD-API docker container or service is running on port `8382`.

---

## Getting Started

### 1. Install Dependencies

```bash
bun install
# or: npm install
```

### 2. Run the Development Server

```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Pipeline Test Suite

Run the automated test runner evaluating 10 complex clinical notes across all specialties:

```bash
bun run scripts/test-pipeline.ts
```

### 4. Build for Production

```bash
bun run build
```

---

## ICD-11 Extension Code Reference (Chapter X)

| Clinical Dimension | Extracted Entity | Extension Code | Name |
|---|---|---|---|
| **Severity** | Severe | `XS25` | Severe |
| | Moderate | `XS0T` | Moderate |
| | Mild | `XS5W` | Mild |
| **Temporality** | Acute | `XT5R` | Acute |
| | Chronic | `XT8W` | Chronic |
| | Subacute | `XT1L` | Subacute |
| **Laterality** | Left | `XK8G` | Left |
| | Right | `XK9J` | Right |
| | Bilateral | `XK8G&XK9J` | Bilateral |
| **Topography** | Foot | `XA47V8` | Foot |
| | Sacrum / Buttock | `XA3VA7` | Buttock / Sacral |
| | Lower extremity | `XA45A6` | Lower extremity |
| | Upper extremity | `XA4BA8` | Upper extremity |
