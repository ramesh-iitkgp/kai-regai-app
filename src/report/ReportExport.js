/**
 * Kai RegAI — PDF Export & Print Engine
 * Phase: P10 — Report Engine
 * 
 * Generates print-ready, high-resolution vector PDF / print documents:
 * - Proper A4 pagination with CSS @page rules and page-break-inside controls
 * - Vector SVG line graphics that scale cleanly at 300 DPI
 * - 100% selectable text, beautiful brand typography, and clean metadata
 */

import { REPORT_THEME } from './ReportTheme.js';
import { ReportRenderer } from './ReportRenderer.js';
import { ReportSchemaValidator } from './ReportSchemaValidator.js';

export class ReportExport {
  /**
   * Compile a complete, standalone, print-ready A4 HTML document
   * @param {import('./ReportSchema.js').ReportModel} report 
   * @returns {string} Standalone HTML document ready for window.print() or headless PDF render
   */
  static compilePrintDocument(report) {
    const validation = ReportSchemaValidator.validate(report);
    if (!validation.valid) {
      throw new Error(`Cannot export invalid report: ${validation.errors.join('; ')}`);
    }

    const reportHTML = ReportRenderer.renderHTML(report);
    const printCSS = ReportRenderer.getPrintStyles();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kai RegAI Reading — ${report.reportId}</title>
  <meta name="author" content="Kai RegAI">
  <meta name="description" content="Personal Hastarekha Palm Reading Report">
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 20mm 15mm;
      @bottom-center {
        content: "Kai RegAI • The Story Written in Your Hands";
        font-size: 8pt;
        color: #94A3B8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #0F172A;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
    }

    .kai-report-container {
      width: 100%;
      margin: 0;
    }

    .kai-report-cover {
      page-break-after: always;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .kai-report-section {
      page-break-inside: avoid;
      margin-bottom: 24pt;
    }

    .kai-chapter {
      page-break-inside: avoid;
      margin-bottom: 18pt;
    }

    .kai-takeaway-card {
      page-break-inside: avoid;
    }

    ${printCSS}
  </style>
</head>
<body>
  ${reportHTML}
  <script>
    // Auto-trigger native print dialog if opened in new window
    window.addEventListener('DOMContentLoaded', () => {
      if (window.location.search.includes('autoprint=true')) {
        window.print();
      }
    });
  </script>
</body>
</html>`;
  }

  /**
   * Trigger native browser PDF print dialog for a report
   * @param {import('./ReportSchema.js').ReportModel} report 
   */
  static triggerBrowserPdfPrint(report) {
    const docHTML = this.compilePrintDocument(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(docHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      // Fallback: inject hidden iframe if popup was blocked
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(docHTML);
      iframe.contentDocument.close();
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    }
  }
}
