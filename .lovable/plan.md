# UK State Pension Buyback Strategy Tool — Lead Magnet for GetStatePension.com

## Overview

An interactive calculator and strategy optimizer for Irish expats/returnees who worked in the UK. The tool helps users understand the ROI of buying back voluntary NI contribution years and creates urgency around the **April 2026 deadline** (when Class 2 contributions are abolished for people abroad). Results are shown freely; lead capture happens after via a CTA to get a personalised report.

## Updated Policy Context (Nov 2025 HMRC Change)

The tool will reflect the latest HMRC policy:

- **From April 2026**: Class 2 contributions for people abroad are being abolished — only Class 3 (5x more expensive) will be available
- **New eligibility**: Applicants will need 10 years of UK residence or NI contributions (up from 3 years)
- **Normal 6-year lookback rule** applies (the special 18-year window expired April 2025)

---

## Page 1: Calculator & Strategy Optimizer

### Hero Section

- Headline: "Is Buying Back UK State Pension Years Worth It?"
- Subheadline referencing the April 2026 Class 2 deadline and getstatepension.com branding
- Clean, minimal design with a professional feel

### Interactive Calculator

Users input:

1. **Current qualifying years** on NI record (slider: 0–35)
2. **Years eligible to buy back** (slider: 0–6, reflecting current 6-year normal rule)
3. **Contribution class eligibility** — Class 2 or Class 3 (with a simple eligibility checker: did you work in UK before leaving? Currently working in Ireland? 3+ years UK residence or NI contributions?)
4. **Current age** and **expected retirement age** (to calculate years until pension and retirement duration)

### Results Dashboard (shown immediately, no gate)

- **Total cost** of buying back years (in EUR, using current GBP/EUR rate)
- **Additional annual pension earned** (in EUR)
- **Break-even timeline** — how many months/years until you recoup your investment
- **Lifetime ROI** — total return over expected retirement: over 10 years and over 20 years example. 
- **Comparison panel**: What happens if you wait and can only use Class 3 after April 2026 (cost difference, reduced ROI)
- **Visual chart**: Cumulative earnings vs cost over retirement years, showing the break-even point clearly. Consider the "triple lock" effect on projected income from uk state pension upon reaching retirement age. 

### Urgency Banner

- Countdown or clear messaging about the April 2026 Class 2 deadline
- Highlight the cost difference: "Acting now at Class 2 saves you X% vs Class 3 from April 2026"

---

## Lead Capture CTA (after results)

After seeing their results, users see a CTA section:

- "Get Your Personalised UK State Pension Report"
- Form fields: **Name**, **Email**, **Phone**, **job title,  Uk working years**, **I know my NI number yes/no, Year I left the UK, I want a quick chat to clarify next steps for applying in time for April 5th 2026 deadline yes/no.**
- The calculator inputs are pre-filled from what they already entered
- Clear value proposition: "Our experts at GetStatePension.com will review your situation and guide you through the HMRC process"
- On submission → data sent to **Close CRM** via a backend edge function

---

## Backend (Lovable Cloud)

- **Edge function**: Receives lead form data and pushes it to Close CRM via their API
- Captures all calculator inputs + contact details as a lead with relevant custom fields
- Exchange rate can be fetched or set as a configurable constant

---

## Design & UX

- Clean, minimal layout — white background, teal/navy accent colors (similar to getstatepension.com branding)
- Mobile-responsive for users coming from social media ads
- Fast, instant calculations with no page reloads
- Trust signals: mention of HMRC source data, gov.uk references