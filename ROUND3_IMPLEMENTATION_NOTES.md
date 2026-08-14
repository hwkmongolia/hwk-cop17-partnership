# HWK–COP17 PARTNERSHIP LANDING PAGE — IMPLEMENTATION NOTES

**Project:** Hiking with Knowledge (HWK), Mongolia — UNCCD COP17 Partnership Landing Page  
**Stage:** Chat-5C2 — Visual Asset Integration & Premium Redesign Complete

---

## 1. FILE & ASSET STRUCTURE

The codebase is engineered strictly as a lightweight, static, GitHub Pages-compatible web package with all image and document assets physically present at the repository root and mirrored in `/assets/images/` and `/assets/documents/`:

```text
/
├── index.html                  # Semantic HTML5 single-page structure (8 sections, image-led)
├── styles.css                  # Responsive, accessible, warm-natural editorial CSS system
├── script.js                  # Lightweight vanilla JavaScript (nav, chips, preselection, iframe transport)
├── hwk-logo.png               # Official HWK brand logo (Root Deployment Asset)
├── hero-field.jpg             # High-impact Hero photo: Youth in field gear across Mongolian steppe
├── biodiversity-in-field.jpg  # Flagship 01 photo: Hands-on botany & biodiversity in meadow
├── connected-waters.jpg       # Flagship 02 photo: Migratory waterbirds & wetland ecosystem
├── living-rangelands.jpg      # Flagship 03 photo: Nomadic herder & youth sharing pasture knowledge
├── evidence-birds.jpg         # Field Evidence: Waterbird monitoring & Demoiselle Cranes at Khun Lake
├── evidence-beaver.jpg        # Field Evidence: Eurasian Beaver & Tuul river basin habitat
├── evidence-insects.jpg       # Field Evidence: Macro insect pollinators & Apollo butterfly
├── evidence-ranger.jpg        # Field Evidence: Protected area ranger & mountain taiga ecology
├── HWK_Partnership_Brief.pdf  # Canonical 1-page partnership brief
├── Biodiversity_in_the_Field.pdf # Canonical Flagship 01 Concept Note
├── Connected_Waters.pdf       # Canonical Flagship 02 Concept Note
├── Living_Rangelands.pdf      # Canonical Flagship 03 Concept Note
├── integration/
│   └── Code.gs                 # Production-ready Google Apps Script receiver for Google Sheets
└── ROUND3_IMPLEMENTATION_NOTES.md
```

---

## 2. VERIFIED VISUAL ASSET BINDING & INVENTORY

All images and PDF resources are **PHYSICALLY PRESENT AND VISIBLY BOUND**:

1. **Brand Identity:**
   * `hwk-logo.png` — Official HWK emblem in header (38px height, object-fit contain).
2. **Hero Editorial Section:**
   * `hero-field.jpg` — Mongolian youth in field gear with binoculars and notebooks on the open green steppe.
3. **Three Flagship Opportunities:**
   * Flagship 01 (Biodiversity in the Field): `biodiversity-in-field.jpg` + Concept PDF `Biodiversity_in_the_Field.pdf`
   * Flagship 02 (Connected Waters): `connected-waters.jpg` + Concept PDF `Connected_Waters.pdf`
   * Flagship 03 (Living Rangelands): `living-rangelands.jpg` + Concept PDF `Living_Rangelands.pdf`
4. **Authentic Field Evidence Grid (6 Cards):**
   * Waterbird Observation & Flyways: `evidence-birds.jpg` (Khun Lake / Tuul Basin)
   * Eurasian Beaver & River Ecology: `evidence-beaver.jpg` (Beaver Reintroduction Center / Gachuurt)
   * Insects & Hidden Small Worlds: `evidence-insects.jpg` (Bogd Khan Mountain)
   * Protected-Area Ranger Learning: `evidence-ranger.jpg` (Bogd Khan Strictly Protected Area)
   * Forest Botany & Plant Communities: `biodiversity-in-field.jpg` (Southern Khentii Taiga Transition)
   * Seasonal Pasture & Nomadic Knowledge: `living-rangelands.jpg` (Hustai National Park Region)
5. **Official Resources Hub:**
   * `HWK_Partnership_Brief.pdf`, `Biodiversity_in_the_Field.pdf`, `Connected_Waters.pdf`, `Living_Rangelands.pdf`

---

## 3. DESIGN SYSTEM & ACCESSIBILITY

* **Typography & Palette:** Warm natural neutrals (`#FBFBFA` canvas), deep forest pine (`#1E3A2B`), slate river blue (`#1C3D5A`), and warm sand accents with Charter serif display headings and clean sans body text.
* **Responsive Breakpoints:** Smooth desktop (2-column editorial split), tablet (adaptive stacking), and mobile ($\le 768\text{px}$) layouts.
* **Touch Targets & Contrast:** All chips and interactive buttons exceed $44\text{px}$ touch targets; text-to-background contrast exceeds WCAG AA standards.

---

## 4. FORM SECURITY & TRANSPORT ARCHITECTURE

1. **Unconfigured Safety Fallback:**
   * When `GOOGLE_APPS_SCRIPT_ENDPOINT === ""`, the form safely displays the fallback notice to email `hikingwithknowledge@gmail.com` without clearing input data.
2. **Verified postMessage Transport:**
   * Sender window identity and trusted origin verification (`script.google.com`, `*.googleusercontent.com`) with timestamped token correlation.
3. **Server-Side Hardening (`integration/Code.gs`):**
   * Script lock concurrency handling, allow-list interest validation, formula injection escaping, and dedicated Google Sheet tab targeting (`hwk_partnership_form`).

---

## 5. INTEGRATION STATUS & TESTING REQUIREMENTS

Code-level repair complete, pending live deployment and end-to-end verification.

1. **Local Preview & Static Compatibility:**  
   `index.html` runs natively without any build dependencies, fully compatible with GitHub Pages hosting.
2. **Form Unconfigured Mode:**  
   Submitting without an endpoint safely displays the direct contact notice without submitting or clearing inputs.
3. **Google Apps Script Web App Deployment:**  
   **Google Apps Script Web App deployment required** before live submissions can be processed. Real endpoint is not yet configured.
4. **Live Google Sheet Submission Test:**  
   **Live Google Sheet submission test required** following Apps Script deployment.
5. **Live Browser End-to-End Verification:**  
   **Live browser end-to-end verification pending** live Web App deployment.

