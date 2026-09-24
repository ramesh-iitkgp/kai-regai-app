# Kai RegAI — Source Registry & Provenance Catalog

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

## 2. Master Source Registry Catalog

### Tradition A: Classical & Historical Indian Palmistry (*Hasta Samudrika Shastra*)

#### `SRC-IND-001`: *Pāṇilekhā* in the *Śārdūlakarṇāvadāna* (ed. Kenneth G. Zysk)
* **Title**: *Pāṇilekhā: An Early Indian Formulation of Palmistry (Critical Edition, Translation, and Notes)*
* **Author / Editor**: Kenneth G. Zysk (Philologist and Professor of Indology)
* **Historical Period / Date**: Original text c. 2nd–4th century CE; critical edition published in *Indo-Iranian Journal* (2020).
* **Language**: Sanskrit (with English translation and critical commentary).
* **Authority Level**: **LEVEL 1 / LEVEL 2** (Scholarly Critical Edition).
* **Tradition Category**: `CLASSICAL_INDIAN` / `HASTA_SAMUDRIKA`.
* **License & Rights Status**: Scholarly article under academic copyright; extracted knowledge consists of non-copyrightable historical facts, textual variants, and philological line descriptions.
* **Core Contribution**: Provides the earliest systematically datable Sanskrit manual on palm lines (*Pāṇilekhā*), establishing ancient nomenclature for major lines (*Pitri*, *Matri*, *Ayush*) and auspicious signs (*Lakshana*).

#### `SRC-IND-002`: *Bṛhat Saṃhitā* of Varāhamihira (Chapters on *Puruṣa-lakṣaṇa* / *Pāṇi-lakṣaṇa*)
* **Title**: *Bṛhat Saṃhitā* (Great Compendium)
* **Author**: Varāhamihira (Astronomer and Polymath of Ujjain)
* **Historical Period / Date**: c. 6th century CE (c. 505–587 CE).
* **Language**: Sanskrit (Historical classical verse).
* **Authority Level**: **LEVEL 1** (Primary Classical Treatise).
* **Tradition Category**: `CLASSICAL_INDIAN` / `SAMUDRIKA_SHASTRA`.
* **License & Rights Status**: Public Domain (Classical work). Translations by Prof. M. Ramakrishna Bhat (1981) referenced for historical verification.
* **Core Contribution**: Foundational descriptions of hand shapes, skin texture, finger lengths, natural coloring of the palm, and auspicious markings (*Chakra*, *Trishula*, *Matsya*, *Padma*).

#### `SRC-IND-003`: *Hastasañjīvana*
* **Title**: *Hastasañjīvana* (Animation/Revival of the Hand)
* **Author**: Meghavijaya Gaṇi (Jain scholar-monk)
* **Historical Period / Date**: c. 17th century CE (1680 CE).
* **Language**: Sanskrit and Western Indian vernacular.
* **Authority Level**: **LEVEL 1 / LEVEL 2** (Historical Indian Palmistry Manual).
* **Tradition Category**: `CLASSICAL_INDIAN` / `HASTA_SAMUDRIKA`.
* **License & Rights Status**: Public Domain (Historical manuscript).
* **Core Contribution**: Dedicated medieval monograph detailing line variations, intersection effects, and planetary mount associations in western Indian traditions.

#### `SRC-IND-004`: *Samudrikatilaka* of Durlabharāja
* **Title**: *Samudrikatilaka* (The Ornament of Samudrika)
* **Author**: Durlabharāja and his son Jagaddeva
* **Historical Period / Date**: c. 12th century CE.
* **Language**: Sanskrit.
* **Authority Level**: **LEVEL 1 / LEVEL 2** (Classical Synthesis).
* **Tradition Category**: `CLASSICAL_INDIAN` / `SAMUDRIKA_SHASTRA`.
* **License & Rights Status**: Public Domain (Classical treatise).
* **Core Contribution**: Codification of physical hand signs, finger spacing, and the constitutional balance between body and palm morphology.

#### `SRC-IND-005`: *Gārgīya-jyotiṣa* (*Aṅga-vidyā* Sections)
* **Title**: *Gārgīya-jyotiṣa* (The Astronomical and Divinatory Treatise of Garga)
* **Author**: Sage Garga (Attributed)
* **Historical Period / Date**: c. 1st century BCE – 1st century CE.
* **Language**: Sanskrit.
* **Authority Level**: **LEVEL 1** (Archaic Sanskrit Treatise).
* **Tradition Category**: `CLASSICAL_INDIAN` / `ANGA_VIDYA`.
* **License & Rights Status**: Public Domain.
* **Core Contribution**: Earliest archaic strata of Indian body and hand omens, establishing the cosmic connection between bodily marks and planetary archetypes.

---

### Tradition B: Modern Indian Palmistry

#### `SRC-IND-101`: *Practical Palmistry* by Dr. Narayan Dutt Shrimali
* **Title**: *Practical Palmistry* (*Hastarekha Vigyan*)
* **Author**: Dr. Narayan Dutt Shrimali
* **Historical Period / Date**: 1985 (Revised editions through 2002).
* **Language**: Hindi / English translation.
* **Authority Level**: **LEVEL 4** (Established Modern Indian Reference).
* **Tradition Category**: `MODERN_INDIAN`.
* **License & Rights Status**: Copyrighted text; only extracted ontological relationships, rule conditions, and traditional attributions are preserved (fair fact extraction). No textual replication.
* **Core Contribution**: Modern synthesis of classical *Hasta Samudrika* with 20th-century life themes (vocational careers, engineering/technology careers, modern marital dynamics, travel lines).

#### `SRC-IND-102`: *Palmistry for All* / *Hastarekha Shastra* by Gopesh Kumar Ojha
* **Title**: *Palmistry for All: Based on Indian and Western Systems*
* **Author**: Pandit Gopesh Kumar Ojha & Ashutosh Ojha
* **Historical Period / Date**: 1972 (Reprinted Motilal Banarsidass).
* **Language**: English / Sanskrit citations.
* **Authority Level**: **LEVEL 4** (Authoritative Comparative Indian Monograph).
* **Tradition Category**: `MODERN_INDIAN` (Comparative).
* **License & Rights Status**: Copyrighted published monograph. Structured facts only.
* **Core Contribution**: Rigorous comparative mapping reconciling Sanskrit *slokas* from *Bhaviṣyapurāṇa* and *Garuda Purāṇa* with modern Western line nomenclature.

#### `SRC-IND-103`: *Palmistry for Pleasure and Profit* by V.A.K. Ayer
* **Title**: *Palmistry for Pleasure and Profit*
* **Author**: V.A.K. Ayer
* **Historical Period / Date**: 1962 (D.B. Taraporevala Sons & Co.).
* **Language**: English.
* **Authority Level**: **LEVEL 4** (Mid-century Indian Classic).
* **Tradition Category**: `MODERN_INDIAN`.
* **License & Rights Status**: Copyrighted historical print.
* **Core Contribution**: Clear practical delineations of the Indian concept of the thumb, mount prominence, and health indications.

---

### Tradition C: Historical & Modern Western Palmistry

#### `SRC-WST-001`: *The Laws of Scientific Hand Reading* by William G. Benham
* **Title**: *The Laws of Scientific Hand Reading: A Practical Treatise on the Art Commonly Called Palmistry*
* **Author**: William G. Benham
* **Historical Period / Date**: 1901 (G.P. Putnam's Sons, New York / London, 635 pages).
* **Language**: English.
* **Authority Level**: **LEVEL 3** (Foundational Historical Western Reference).
* **Tradition Category**: `WESTERN_HISTORICAL`.
* **License & Rights Status**: **Public Domain** (Published prior to 1928).
* **Core Contribution**: The definitive encyclopedic standard for 20th-century Western palmistry. Meticulous physical descriptions of mounts, line defects (islands, chains, splits), finger phalange ratios, and psychological character types.

#### `SRC-WST-002`: *Palmistry for All* by Cheiro (Count Louis Hamon)
* **Title**: *Palmistry for All: Containing New Information on the Study of the Hand Never Before Published*
* **Author**: Cheiro (Count Louis Hamon)
* **Historical Period / Date**: 1916 (Herbert Jenkins Ltd., London).
* **Language**: English.
* **Authority Level**: **LEVEL 3** (Canonical Historical Western Reference).
* **Tradition Category**: `WESTERN_HISTORICAL`.
* **License & Rights Status**: **Public Domain** (Published prior to 1928).
* **Core Contribution**: Highly accessible, systematic taxonomy of the 7 types of hands, the shape of the fingers, the thumb, the major lines (Life, Head, Heart, Fate, Sun), the line of Health, and marriage markings.

#### `SRC-WST-003`: *Les Mystères de la Main* by Adolphe Desbarrolles
* **Title**: *Les Mystères de la Main Révélés et Expliqués* (The Mysteries of the Hand)
* **Author**: Adolphe Desbarrolles
* **Historical Period / Date**: 1859 (Paris).
* **Language**: French (Historical 19th-century).
* **Authority Level**: **LEVEL 3** (Foundational Western Chirognomy).
* **Tradition Category**: `WESTERN_HISTORICAL`.
* **License & Rights Status**: **Public Domain**.
* **Core Contribution**: Introduced the modern Western spatial system of planetary mounts on the palmar surface, later adapted across European and American schools.

---

## 3. Machine-Readable Source Registry (`knowledge/sources/sources.json`)

All source entities in Kai RegAI are stored as JSON records adhering to `knowledge/schema/source.schema.json`.

```json
{
  "source_id": "SRC-WST-001",
  "title": "The Laws of Scientific Hand Reading",
  "author": "William G. Benham",
  "publication_year": 1901,
  "language": "en",
  "tradition": "WESTERN_HISTORICAL",
  "source_type": "HISTORICAL_BOOK",
  "authority_level": "LEVEL_3",
  "license": "PUBLIC_DOMAIN",
  "rights_status": "PUBLIC_DOMAIN_WORLDWIDE",
  "url": "https://archive.org/details/lawsofscientifi00benh",
  "edition": "First Edition, G.P. Putnam's Sons, 635 pp.",
  "notes": "Encyclopedic source for line morphology, mount defects, and finger phalanxes."
}
```
