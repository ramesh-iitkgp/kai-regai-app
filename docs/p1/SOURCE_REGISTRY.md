# Kai RegAI — Source Registry & Provenance Catalog (Hardened v1.1)

## 1. Source Hierarchy & Authority Classification

To prevent ungrounded internet claims from entering the interpretation engine, Kai RegAI enforces a strict 7-tier Source Authority Hierarchy:

```
[Level 1: Primary Historical Text / Critical Edition]
         │ (Highest academic/historical rigor)
         ▼
[Level 2: Scholarly Translation / Academic Study]
         │ (Peer-reviewed philological & cultural translations)
         ▼
[Level 3: Established Historical Palmistry Book]
         │ (Foundational public-domain works: 1850–1925)
         ▼
[Level 4: Established Modern Palmistry Reference]
         │ (Recognized 20th/21st-century published monographs)
         ▼
[Level 5: Modern Practitioner Material]
         │ (Published field observations, contemporary hand readers)
         ▼
═══════════════════════════════════════════════════════════════════
[Level 6: Secondary Web Content]  ──> DISALLOWED FOR PRODUCTION RULES
[Level 7: Unverified Internet Claims] ──> STRICTLY PROHIBITED
```

* **Production Rule Policy**: Production rules must draw exclusively from **Levels 1 through 4**. Level 5 may be utilized only with explicit secondary corroboration. Levels 6 and 7 are rejected.

---

## 2. Hardened Source Registry Catalog

### Tradition A: Classical & Historical Indian Palmistry (*Hasta Samudrika Shastra*)

#### `SRC-IND-001`: *Early Indian Palmistry: Śārdūlakarṇāvadāna: Pāṇilekhā* (Kenneth G. Zysk)
* **Title**: *Early Indian Palmistry: Śārdūlakarṇāvadāna: Pāṇilekhā*
* **Author**: Kenneth G. Zysk (Professor Emeritus of Indology, University of Copenhagen)
* **Chronological Milestones**:
  * **Original Text Composition**: c. 1st–2nd century CE (narrative frame of *Śārdūlakarṇāvadāna*, Text 33 of the *Divyāvadāna* collection).
  * **Redaction Date**: Latter half of the 9th century CE (after 864 CE; incorporation of astral science and divination chapters including *Pāṇilekhā*, *Kanyālakṣaṇa*, and *Svapnādhyāya*).
  * **Manuscript Witnesses**: Nepalese Sanskrit palm-leaf and paper manuscripts dating from the 11th to 19th centuries CE (e.g. Cambridge University Library Add. 865, Asiatic Society of Bengal, National Archives of Nepal).
  * **Earlier Scholarly Research by Zysk**: *The Indian System of Human Marks* (2 vols., Brill, 2016).
  * **First Printed Edition**: 1954 (Sujitkumar Mukhopadhyaya, *The Śārdūlakarṇāvadāna*, Visvabharati, Santiniketan, pp. 64–66).
  * **Critical Edition & Translation**: Kenneth G. Zysk (Critical Sanskrit edition of the 34 verses, English translation, and analysis).
  * **Journal Publication**: *History of Science in South Asia* (HSSA), Volume 13 (2025), pp. 240–275. ISSN: 2369-7725.
  * **Online Publication Date**: October 31, 2025.
  * **Reference Publication Year**: 2025.
  * **Digital Object Identifier (DOI)**: [https://doi.org/10.18732/hssa128](https://doi.org/10.18732/hssa128).
* **Language**: Sanskrit (with English translation and philological notes).
* **Authority Level**: **LEVEL 1 / LEVEL 2** (Scholarly Critical Edition).
* **Tradition Category**: `CLASSICAL_INDIAN` / `HASTA_SAMUDRIKA`.
* **Epistemic Status**: `SCHOLARLY_ANALYSIS`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `OPEN_ACCESS_CC_BY_4_0`
  * `rights_basis`: Published open access under the Creative Commons Attribution 4.0 International License (CC BY 4.0). The underlying ancient Sanskrit text is public domain worldwide.
  * `jurisdictions_checked`: ["US", "EU", "IN", "UK", "CA"]
  * `edition_specific`: true
  * `translation_rights_checked`: true
  * `commercial_use`: `FULL_COMMERCIAL_USE_PERMITTED_WITH_ATTRIBUTION`
  * `notes`: The open-access CC BY 4.0 license permits commercial and non-commercial adaptation and reuse with appropriate author attribution.
* **Core Contribution**: The definitive critical edition and translation of the earliest systematically datable Sanskrit manual on palm lines (*Pāṇilekhā*). Documents the early synthesis of astral science (*jyotiḥśāstra*) with palmistry.

#### `SRC-IND-002`: *Bṛhat Saṃhitā* of Varāhamihira (Chapters on *Puruṣa-lakṣaṇa* / *Pāṇi-lakṣaṇa*)
* **Title**: *Bṛhat Saṃhitā* (The Great Compendium)
* **Author**: Varāhamihira (Polymath of Ujjain, c. 505–587 CE)
* **Chronological Milestones**:
  * **Original Text Composition**: c. mid-6th century CE (c. 550 CE).
  * **Manuscript Witnesses**: Hundreds of palm-leaf and paper manuscripts across India.
  * **First Printed Edition**: 1864–1865 (ed. Hendrik Kern, Bibliotheca Indica, Calcutta).
  * **Scholarly Translations**: 1870–1874 (H. Kern); 1981 (Prof. M. Ramakrishna Bhat, Motilal Banarsidass).
  * **Reference Publication Year**: 550 CE.
* **Language**: Sanskrit.
* **Authority Level**: **LEVEL 1** (Primary Classical Sanskrit Treatise).
* **Tradition Category**: `CLASSICAL_INDIAN` / `SAMUDRIKA_SHASTRA`.
* **Epistemic Status**: `HISTORICAL_TEXT`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: Original Sanskrit text is public domain worldwide. M. Ramakrishna Bhat's 1981 English translation is copyrighted in India through 2042.
  * `jurisdictions_checked`: ["IN", "US", "UK", "EU"]
  * `edition_specific`: true
  * `translation_rights_checked`: true
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
  * `notes`: Direct citations refer exclusively to the public domain Sanskrit verse contents and independent Kai RegAI English translations.
* **Core Contribution**: Foundational classical descriptions of hand shapes, skin texture, finger proportions, and royal signs (*Maha-Lakshanas* like *Matsya*, *Padma*, *Trishula*).

#### `SRC-IND-003`: *Hastasañjīvana*
* **Title**: *Hastasañjīvana* (Revival of the Hand)
* **Author**: Meghavijaya Gaṇi (Jain scholar-monk of the Tapā Gaccha)
* **Chronological Milestones**:
  * **Original Text Composition**: 1680 CE (Vikrama Samvat 1737).
  * **Manuscript Witnesses**: Western Indian Jain monastic collections (Patan, Cambay, Ahmedabad).
  * **First Printed Edition**: 1928 (ed. Yashovijaya Jaina Granthamala, Bhavnagar/Bombay).
  * **Reference Publication Year**: 1680 CE.
* **Language**: Sanskrit with Old Gujarati glosses.
* **Authority Level**: **LEVEL 1** (Historical Classical Monograph).
* **Tradition Category**: `CLASSICAL_INDIAN` / `HASTA_SAMUDRIKA`.
* **Epistemic Status**: `HISTORICAL_TEXT`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: 1680 CE composition; 1928 printed text is public domain in the US and India.
  * `jurisdictions_checked`: ["IN", "US", "UK"]
  * `edition_specific`: true
  * `translation_rights_checked`: false
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
* **Core Contribution**: Dedicated medieval monograph detailing line variations, intersection effects, and planetary mount associations in western Indian traditions.

#### `SRC-IND-004`: *Samudrikatilaka* of Durlabharāja
* **Title**: *Samudrikatilaka* (The Ornament of Samudrika)
* **Author**: Durlabharāja (completed by his son Jagaddeva)
* **Chronological Milestones**:
  * **Original Text Composition**: c. 1160–1180 CE (reign of Chaulukya King Kumārapāla).
  * **First Printed Edition**: Gaekwad's Oriental Series, Baroda.
  * **Reference Publication Year**: 1170 CE.
* **Language**: Sanskrit.
* **Authority Level**: **LEVEL 1 / LEVEL 2** (Classical Synthesis).
* **Tradition Category**: `CLASSICAL_INDIAN` / `SAMUDRIKA_SHASTRA`.
* **Epistemic Status**: `HISTORICAL_TEXT`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: Root 12th-century Sanskrit verses are public domain worldwide.
  * `jurisdictions_checked`: ["IN", "US"]
  * `edition_specific`: true
  * `translation_rights_checked`: false
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
* **Core Contribution**: Codification of physical hand signs, finger spacing, and the constitutional balance between body and palm morphology.

#### `SRC-IND-005`: *Gārgīya-jyotiṣa* (*Aṅga-vidyā* Sections)
* **Title**: *Gārgīya-jyotiṣa* (The Divinatory Treatise of Sage Garga)
* **Author**: Sage Garga (Attributed)
* **Chronological Milestones**:
  * **Original Text Composition**: c. 1st century BCE to 1st century CE.
  * **Manuscript Witnesses**: Fragmentary Sanskrit manuscripts.
  * **Reference Publication Year**: c. 50 CE.
* **Language**: Sanskrit.
* **Authority Level**: **LEVEL 1** (Archaic Sanskrit Treatise).
* **Tradition Category**: `CLASSICAL_INDIAN` / `ANGA_VIDYA`.
* **Epistemic Status**: `HISTORICAL_TEXT`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: Ancient text in the public domain worldwide.
  * `jurisdictions_checked`: ["IN", "US"]
  * `edition_specific`: false
  * `translation_rights_checked`: false
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
* **Core Contribution**: Earliest archaic strata connecting bodily and palmar marks to cosmic archetypes.

---

### Tradition B: Modern Indian Palmistry

#### `SRC-IND-101`: *Practical Palmistry* by Dr. Narayan Dutt Shrimali
* **Title**: *Practical Palmistry* (*Hastarekha Vigyan*)
* **Author**: Dr. Narayan Dutt Shrimali (1933–1998)
* **Chronological Milestones**:
  * **Original Text Composition**: 1985.
  * **First Printed Edition**: 1985 (Pustak Mahal, Delhi).
  * **English Translation**: Published 1989 / Rev. 2002.
  * **Reference Publication Year**: 1985.
* **Language**: Hindi / English translation.
* **Authority Level**: **LEVEL 4** (Established Modern Indian Practitioner Reference).
* **Tradition Category**: `MODERN_INDIAN`.
* **Epistemic Status**: `TRADITIONAL_INTERPRETATION` (Modern practitioner synthesis).
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `COPYRIGHTED_COMMERCIAL_WORK`
  * `rights_basis`: Protected under the Indian Copyright Act 1957 (life of author + 60 years; author died in 1998, protected through 2058) and the Berne Convention.
  * `jurisdictions_checked`: ["IN", "US", "UK"]
  * `edition_specific`: true
  * `translation_rights_checked`: true
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
  * `notes`: Strictly limited to the extraction of uncopyrightable factual correspondences and traditional Sanskrit rule conditions. Verbatim prose replication is prohibited.
* **Core Contribution**: Modern synthesis of classical *Hasta Samudrika* with contemporary professional life themes (corporate careers, modern marital dynamics, travel lines).

#### `SRC-IND-102`: *Palmistry for All* by Gopesh Kumar Ojha
* **Title**: *Palmistry for All: Based on Indian and Western Systems*
* **Author**: Pandit Gopesh Kumar Ojha (1907–1983) and Ashutosh Ojha
* **Chronological Milestones**:
  * **Original Text Composition**: 1972.
  * **First Printed Edition**: 1972 (Motilal Banarsidass, Delhi).
  * **Reference Publication Year**: 1972.
* **Language**: English with Sanskrit citations.
* **Authority Level**: **LEVEL 4** (Authoritative Comparative Indian Monograph).
* **Tradition Category**: `MODERN_INDIAN` (Comparative).
* **Epistemic Status**: `TRADITIONAL_INTERPRETATION`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `COPYRIGHTED_COMMERCIAL_WORK`
  * `rights_basis`: Protected under the Indian Copyright Act 1957 through 2043.
  * `jurisdictions_checked`: ["IN", "US", "UK"]
  * `edition_specific`: true
  * `translation_rights_checked`: true
  * `commercial_use`: `FACTUAL_EXTRACTION_ONLY`
* **Core Contribution**: Rigorous comparative mapping reconciling Sanskrit *slokas* from *Bhaviṣyapurāṇa* and *Gāruḍapurāṇa* with Western line terminology.

---

### Tradition C: Historical Western Palmistry

#### `SRC-WST-001`: *The Laws of Scientific Hand Reading* by William G. Benham
* **Title**: *The Laws of Scientific Hand Reading: A Practical Treatise on the Art Commonly Called Palmistry*
* **Author**: William G. Benham (1866–1944)
* **Chronological Milestones**:
  * **Original Text Composition**: 1898–1900.
  * **First Printed Edition**: 1900 / 1901 (G.P. Putnam's Sons, New York and London, 635 pages).
  * **Reference Publication Year**: 1901.
* **Language**: English.
* **Authority Level**: **LEVEL 3** (Foundational Historical Western Treatise).
* **Tradition Category**: `WESTERN_HISTORICAL`.
* **Epistemic Status**: `HISTORICAL_TEXT` (Historical practitioner manual; the word "Scientific" in the title is historical chirognomic nomenclature, NOT modern empirical science).
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: Published in the US in 1901 (pre-1929 US public domain). In the UK/EU, author passed away in 1944 (1944 + 70 years = entered UK/EU public domain January 1, 2015).
  * `jurisdictions_checked`: ["US", "UK", "EU"]
  * `edition_specific`: true
  * `translation_rights_checked`: false
  * `commercial_use`: `FULL_COMMERCIAL_USE_PERMITTED`
  * `notes`: The 1901 original edition is in the public domain in the US and UK/EU. Modern reprint introductions or new content remain under separate copyright.
* **Core Contribution**: Meticulous physical descriptions of mounts, line defects (islands, chains, splits), and finger phalange ratios.

#### `SRC-WST-002`: *Palmistry for All* by Cheiro (Count Louis Hamon)
* **Title**: *Palmistry for All: Containing New Information on the Study of the Hand Never Before Published*
* **Author**: Cheiro (Count Louis Hamon, 1866–1936)
* **Chronological Milestones**:
  * **Original Text Composition**: 1915.
  * **First Printed Edition**: 1916 (Herbert Jenkins Ltd., London; G.P. Putnam's Sons, New York).
  * **Reference Publication Year**: 1916.
* **Language**: English.
* **Authority Level**: **LEVEL 3** (Canonical Historical Western Practitioner Reference).
* **Tradition Category**: `WESTERN_HISTORICAL`.
* **Epistemic Status**: `HISTORICAL_TEXT`.
* **Jurisdiction-Aware Rights**:
  * `rights_status`: `PUBLIC_DOMAIN_QUALIFIED`
  * `rights_basis`: Published in 1916 (pre-1929 US public domain). In UK/EU, author passed away in 1936 (1936 + 70 years = entered UK/EU public domain January 1, 2007).
  * `jurisdictions_checked`: ["US", "UK", "EU"]
  * `edition_specific`: true
  * `translation_rights_checked`: false
  * `commercial_use`: `FULL_COMMERCIAL_USE_PERMITTED`
  * `notes`: The 1916 original print edition is in the public domain in the US and Europe.
* **Core Contribution**: Systematic taxonomy of the 7 types of hands, the fingers, the thumb, and the major and minor lines.
