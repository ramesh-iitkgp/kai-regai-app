# P10 PDF Export & Print Engine Specification

## 1. Zero-Dependency Vector PDF Generation

Rather than bundling heavy native PDF compilers or screenshotting low-resolution bitmapped canvases, Kai RegAI utilizes standard CSS Paged Media and browser print rendering:
```text
ReportModel
    ↓
ReportExport.compilePrintDocument()
    ↓
Vector A4 HTML Document + @media print CSS
    ↓
window.print() / Native Print to PDF
```

---

## 2. A4 Pagination & Page Break Controls

The compiled print document adheres to international A4 dimensions (`210mm x 297mm`):
```css
@page {
  size: A4 portrait;
  margin: 15mm 15mm 20mm 15mm;
  @bottom-center {
    content: "Kai RegAI • The Story Written in Your Hands";
    font-size: 8pt;
    color: #94A3B8;
  }
}
```

### Page Break Invariants:
* **Cover Page**: `page-break-after: always;` guarantees the dedicated cover occupies Page 1 exclusively.
* **Orphan Prevention**: `page-break-inside: avoid;` is applied to `.kai-report-section`, `.kai-chapter`, and `.kai-takeaway-card`.
* **Print Color Management**: `-webkit-print-color-adjust: exact;` preserves semantic line colors while converting dark backgrounds to clean, ink-conserving light backgrounds.
* **Vector Crispness**: Scalable SVG lines render at native 300+ DPI without rasterization blur. Text remains selectable and searchable.
