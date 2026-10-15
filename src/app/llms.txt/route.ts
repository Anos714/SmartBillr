const BODY = `# SmartBillr

Free invoice generator for Indian freelancers. GST-ready, no signup for basics.

## Features
- Live preview editor, guest mode (no signup)
- GST invoices: GSTIN, CGST/SGST split, HSN codes
- 8 designer templates (2 free forever)
- PDF in one click, UPI-friendly totals, custom logo (Pro)

## Pricing
- Free ₹0: 2 templates, unlimited invoices, watermark
- Pro ₹999 lifetime or ₹199/mo: all 8 templates, watermark-free, logo, GST template

## Templates
- 2 free (Minimal White, Freelancer Pop) + 6 premium incl. GST tax invoice
- See /templates

## FAQ
- No signup needed; free has watermark; Pro removes it + unlocks GST template
- PDFs print-ready; data stays in browser unless you save

## Links
- / | /create/invoice | /templates | /pricing
- /about | /contact | /privacy | /terms
- /guides/gst-invoice | /guides/freelancer | /compare/invoicely-alternative
`;

export function GET() {
  return new Response(BODY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
