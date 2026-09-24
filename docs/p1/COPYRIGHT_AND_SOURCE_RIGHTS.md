# Kai RegAI — Copyright & Source Rights Management

## 1. Legal Stance & Compliance Principles

Commercial AI products that indiscriminately scrape, ingest, and mirror copyrighted books expose their organizations to catastrophic copyright infringement liabilities.

**Kai RegAI enforces a zero-infringement, clean-room knowledge ingestion architecture**:

```
+─────────────────────────────────────────────────────────────────────────────+
|                        CLEAN-ROOM KNOWLEDGE PIPELINE                        |
|                                                                             |
|  [Copyrighted Book / Academic Text]                                         |
|         │                                                                   |
|         ▼  (Reading & Legal Analysis)                                       |
|  [Extraction of NON-COPYRIGHTABLE FACTS, SYMBOLS & CORRELATIONS]             |
|  (Idea/Expression Dichotomy: Ideas and historical lore are public domain)   |
|         │                                                                   |
|         ▼  (Original Codification)                                          |
|  [Independent Authoring of JSON Rules & Schemas by Kai RegAI]               |
|         │                                                                   |
|         ▼                                                                   |
|  [NO Direct Literary Text or Extended Paragraphs Stored in Repo]            |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Core Legal Distinctions

### A. The Idea / Expression Dichotomy (US Title 17 § 102(b), Indian Copyright Act § 13)
* **Copyright protects the original literary expression** (the specific sentences, phrasing, chapter prose, and artistic illustrations of an author).
* **Copyright DOES NOT protect ideas, procedures, systems, methods of operation, concepts, principles, or historical traditions**.
* *Application in Kai RegAI*: The ancient belief that "a wide Life Line signifies vitality" is a centuries-old cultural concept free for use by all humankind. Our repository stores this concept in an independently drafted, structured JSON rule with attribution, storing zero verbatim sentences from modern copyrighted books.

### B. Public Domain Thresholds (Worldwide Standard)
* **Works Published Prior to 1928**: All works published in the United States or United Kingdom prior to January 1, 1928, are in the **Public Domain worldwide**.
* *Status in Kai RegAI*:
  * William G. Benham, *The Laws of Scientific Hand Reading* (Published **1901**): **100% PUBLIC DOMAIN**. Free for full text study, commercial adaptation, and algorithmic translation.
  * Cheiro, *Palmistry for All* (Published **1916**): **100% PUBLIC DOMAIN**. Free for full commercial derivative use.
  * Classical Sanskrit Texts (*Bṛhat Saṃhitā*, *Pāṇilekhā*, *Hastasañjīvana*): Composed between 100 BCE and 1700 CE: **100% PUBLIC DOMAIN**.

---

## 3. Detailed Source Rights Ledger

| Source ID | Source Work & Author | Publication Date | Copyright Status | Full-Text Storage Permitted? | Commercial Rule Derivation Permitted? | Direct Quotation Permitted? |
|---|---|---|---|---|---|---|
| `SRC-IND-001` | *Pāṇilekhā* in *Śārdūlakarṇāvadāna* (Zysk ed.) | 2020 (Critical edition of ancient text) | Ancient text is Public Domain; Editorial commentary is copyrighted | **NO** (Do not store paper PDF) | **YES** (Extraction of historical line names and Sanskrit concepts) | Fair-use short academic citation only |
| `SRC-IND-002` | *Bṛhat Saṃhitā* (Varāhamihira) | c. 550 CE | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |
| `SRC-IND-003` | *Hastasañjīvana* (Meghavijaya Gaṇi) | 1680 CE | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |
| `SRC-IND-004` | *Samudrikatilaka* (Durlabharāja) | c. 1150 CE | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |
| `SRC-IND-101` | *Practical Palmistry* (Dr. N.D. Shrimali) | 1985 | **COPYRIGHTED** (Pustak Mahal) | **NO** | **YES** (Independent fact & condition structuring) | **NO** (Strictly forbidden) |
| `SRC-IND-102` | *Palmistry for All* (Gopesh Kumar Ojha) | 1972 | **COPYRIGHTED** (Motilal Banarsidass) | **NO** | **YES** (Comparative taxonomy structuring) | **NO** (Strictly forbidden) |
| `SRC-WST-001` | *The Laws of Scientific Hand Reading* (Benham) | 1901 | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |
| `SRC-WST-002` | *Palmistry for All* (Cheiro) | 1916 | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |
| `SRC-WST-003` | *Les Mystères de la Main* (Desbarrolles) | 1859 | **PUBLIC DOMAIN** | **YES** | **YES** | **YES** |

---

## 4. Repository Code & Ingestion Directives

1. **No Book PDF Dumps**: Never commit raw scans, e-books, EPUBs, or PDFs of copyrighted modern 20th/21st-century books into the repository.
2. **Independent Rule Phrasing**: All `reflective_synthesis` and `meaning` fields in `interpretation_rule` schemas must be freshly and independently composed by Kai RegAI authors, using our modern, elevated, empathetic brand voice.
3. **Attribution For Provenance, Not Licensing**: Listing an author in `source_id` is an academic acknowledgment of historical provenance, not a trademark endorsement or commercial association.
