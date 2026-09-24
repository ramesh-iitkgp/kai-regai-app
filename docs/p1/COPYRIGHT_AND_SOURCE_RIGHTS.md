# Kai RegAI — Copyright & Source Rights Management

## 1. Legal Stance & Compliance Principles

Commercial AI products that indiscriminately scrape, ingest, and mirror copyrighted books expose their organizations to substantial copyright infringement liabilities.

**Kai RegAI enforces a zero-infringement, clean-room knowledge ingestion architecture**:

```
+─────────────────────────────────────────────────────────────────────────────+
|                        CLEAN-ROOM KNOWLEDGE PIPELINE                        |
|                                                                             |
|  [Copyrighted Book / Academic Text / Historical Edition]                    |
|         │                                                                   |
|         ▼  (Jurisdiction & Edition-Specific Legal Analysis)                 |
|  [Extraction of NON-COPYRIGHTABLE FACTS, SYMBOLS & CORRELATIONS]             |
|  (Idea/Expression Dichotomy: Ideas and historical lore are not copyrightable)|
|         │                                                                   |
|         ▼  (Original Codification)                                          |
|  [Independent Authoring of JSON Rules & Schemas by Kai RegAI]               |
|         │                                                                   |
|         ▼                                                                   |
|  [NO Direct Literary Text, Scans, or Extended Paragraphs Stored in Repo]    |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Jurisdiction- and Edition-Aware Rights Framework

Kai RegAI **rejects simplistic blanket assumptions** such as *"published before 1928 = public domain worldwide."* Copyright laws vary substantially across jurisdictions, and separate copyright layers attach to translations, critical apparatus, and modern editions.

### A. The Seven Layers of Copyright Separation
When evaluating any source, the following layers are independently analyzed:
1. **Original Historical Work**: The underlying root text composed by the historical author.
2. **Modern Translation**: A translation into English or another language creates an independent copyright owned by the translator.
3. **Critical Edition**: Philological reconstruction, collation of manuscript variants, and critical apparatus may be protected by academic copyright.
4. **Commentary & Glosses**: Explanatory notes, footnotes, or introductions are independently protected.
5. **Annotations & Formatting**: Modern typographical arrangements and indices.
6. **Reproduction & Facsimile**: Pure photographic reprints without original creativity.
7. **Digitized Scans**: Digital scans of public-domain books do not generate new copyright under US and EU law (e.g. *Bridgeman Art Library v. Corel Corp.*), but repository access terms must still be respected.

### B. Jurisdictional Realities
* **United States (17 U.S.C.)**: Works published before January 1, 1929, are in the US public domain. However, modern translations (even of ancient texts) published after 1928 remain under copyright for 95 years from publication or author's life + 70 years.
* **United Kingdom & European Union**: General rule is author's life + 70 years (*post mortem auctoris*). A pre-1929 work by an author who died after 1955 remains under copyright in the UK/EU even if public domain in the US.
* **India (Indian Copyright Act 1957)**: Author's life + 60 years from the year following death (§ 22). Posthumous or corporate works are protected for 60 years from publication date.

---

## 3. Detailed Source Rights Ledger

Every source in the Kai RegAI registry is evaluated across multiple jurisdictions:

```json
{
  "rights_status": "",
  "rights_basis": "",
  "jurisdictions_checked": [],
  "edition_specific": true,
  "translation_rights_checked": false,
  "commercial_use": "",
  "notes": ""
}
```

| Source ID | Source & Author | Edition Evaluated | Jurisdictions Checked | Rights Status | Commercial Use Policy | Notes & Layer Boundaries |
|---|---|---|---|---|---|---|
| `SRC-IND-001` | *Pāṇilekhā* in *Śārdūlakarṇāvadāna* (Kenneth G. Zysk) | *Indo-Iranian Journal* 63 (2020), Brill Academic | US, EU, IN, UK | `COPYRIGHTED_SCHOLARLY_WORK` | `FACTUAL_EXTRACTION_ONLY` | Sanskrit root verses (~2000 years old) are public domain; Zysk's 2020 English translation, critical apparatus, and introductory study are under copyright (Brill). No PDF or verbatim translation text stored in repo. Facts/line mappings extracted only. |
| `SRC-IND-002` | *Bṛhat Saṃhitā* (Varāhamihira) | Sanskrit Root Verses (Ch. 67-68); compared with M.R. Bhat (1981) | IN, US, UK, EU | `PUBLIC_DOMAIN_QUALIFIED` | `FACTUAL_EXTRACTION_ONLY` | Original 6th-century Sanskrit text is public domain worldwide. M. Ramakrishna Bhat's 1981 translation and notes are copyrighted in India (under protection until 2042). Independent Kai RegAI English translations and structured rules used exclusively. |
| `SRC-IND-003` | *Hastasañjīvana* (Meghavijaya Gaṇi) | 1928 Yashovijaya Jaina Granthamala printed edition | IN, US, UK | `PUBLIC_DOMAIN_QUALIFIED` | `FACTUAL_EXTRACTION_ONLY` | Authored 1680 CE; 1928 printed edition text is public domain in the US and India. Any later modern editorial introductions require exclusion. |
| `SRC-IND-004` | *Samudrikatilaka* (Durlabharāja & Jagaddeva) | Classical Sanskrit Manuscript text (12th c.) | IN, US | `PUBLIC_DOMAIN_QUALIFIED` | `FACTUAL_EXTRACTION_ONLY` | Root classical text is public domain. Modern critical editions must not be reproduced verbatim. |
| `SRC-IND-101` | *Practical Palmistry* (Dr. N.D. Shrimali) | 1985 / 2002 Pustak Mahal Edition | IN, US, UK | `COPYRIGHTED_COMMERCIAL_WORK` | `FACTUAL_EXTRACTION_ONLY` | Author passed away in 1998; protected under Indian Copyright Act until 2058. Strictly limited to extraction of uncopyrightable historical ideas, feature combinations, and Sanskrit terms. Zero literary prose replication. |
| `SRC-IND-102` | *Palmistry for All* (Gopesh Kumar Ojha) | 1972 Motilal Banarsidass Edition | IN, US, UK | `COPYRIGHTED_COMMERCIAL_WORK` | `FACTUAL_EXTRACTION_ONLY` | Fully copyrighted in India and internationally. Comparative mappings and traditional sloka references extracted as structured data only. |
| `SRC-WST-001` | *The Laws of Scientific Hand Reading* (William G. Benham) | 1901 First Edition, G.P. Putnam's Sons | US, UK, EU | `PUBLIC_DOMAIN_QUALIFIED` | `FULL_COMMERCIAL_USE_PERMITTED` | Published in US in 1901 (pre-1929 US public domain). Author died in 1944 (1944 + 70 = entered UK/EU public domain January 1, 2015). Original 1901 text and illustrations are free for commercial derivative use. Later modern reprint forewords excluded. |
| `SRC-WST-002` | *Palmistry for All* (Cheiro / Count Louis Hamon) | 1916 Herbert Jenkins Edition | US, UK, EU | `PUBLIC_DOMAIN_QUALIFIED` | `FULL_COMMERCIAL_USE_PERMITTED` | Published in 1916 (pre-1929 US public domain). Author died in 1936 (1936 + 70 = entered UK/EU public domain January 1, 2007). Original 1916 edition text is public domain in US, UK, and EU. |
| `SRC-WST-003` | *Les Mystères de la Main* (Adolphe Desbarrolles) | 1859 Paris Edition | US, FR, EU, UK | `PUBLIC_DOMAIN_QUALIFIED` | `FULL_COMMERCIAL_USE_PERMITTED` | Author died in 1886; published in 1859. Public domain worldwide. |

---

## 4. Repository Code & Ingestion Directives

1. **No Proprietary Text in Source Tree**: Never store scans, PDFs, or extended excerpts of copyrighted works in the repository.
2. **Fact vs. Expression Extraction**: In accordance with US 17 U.S.C. § 102(b) and Indian Copyright Act § 13, historical correlations (e.g. *“a curved heart line terminating between Jupiter and Saturn correlates with balanced emotional devotion”*) are non-copyrightable ideas.
3. **Independent Brand Voice**: All user-facing narratives are independently authored by Kai RegAI in an empathetic, modern reflective tone.
