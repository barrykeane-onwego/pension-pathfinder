

# Fix Break-Even Calculation and Emphasise Triple-Lock Break-Even

## Critical Bug Found

The calculator has an inconsistency: the **cost line** on the chart uses `totalInvestmentEUR` (buyback + future Class 3 contributions), but the **earnings lines** only count pension from the `yearsToBuyBack` (6 years). The future 9 years of Class 3 contributions also add qualifying years and pension income, but aren't reflected in earnings. This makes break-even appear much later than it should.

For the example case (45yo, 20 current, 6 buyback, 9 future):
- Current earnings calc: only 6/35 of full pension = ~€2,218/yr at today's rates
- Should be: all 15 additional years (6+9) = 15/35 of full pension = ~€5,545/yr at today's rates
- With triple lock at claim time (22 years): ~€5,545 × 1.035^22 ≈ ~€11,790/yr
- Total investment: ~€10,819
- True break-even with triple lock: under 1 year of pension income

OR — the alternative interpretation is that the earnings line should only reflect the additional pension attributable to the buyback (the 6 years), and the cost line should only show buyback cost. The future contributions are a separate ongoing cost/benefit. This would keep the chart focused on the CF83 decision.

**I recommend showing TWO break-even figures:**
1. **Buyback-only break-even** (triple lock): buyback cost vs buyback pension earnings — this is the CF83 sales message
2. **Total journey break-even** (triple lock): total investment vs total additional pension — the full picture

## Changes

### `src/lib/pension-calculator.ts`
- Add `totalAdditionalYears = yearsToBuyBack + futureYearsToContribute`
- Add `totalAdditionalAnnualPensionEUR` based on all additional years
- Add `breakEvenMonthsTripleLock` — iterates month-by-month with triple-lock-inflated annual pension until cumulative earnings exceed total investment
- Add `breakEvenMonthsBuybackTripleLock` — same but only buyback cost vs buyback pension
- Update chart data to include a `cumulativeEarningsTotal` line for total additional pension

### `src/components/ResultsDashboard.tsx`
- Replace the current flat break-even card with a prominent **triple-lock break-even card**
- Show "Break-even with triple lock: ~X years Y months" as the primary figure
- Add explanatory text: "Your pension will be set at triple-lock-adjusted rates when you claim at age 67"
- Style it as a highlighted/emphasised card (larger, coloured border)

### `src/components/PensionChart.tsx`
- Change the chart's `breakEvenYear` to use the triple-lock earnings line (`cumulativeEarningsTripleLock >= cost`) — currently it uses the flat line
- Add an annotation/callout at the break-even point (not just a reference line — add a labelled dot or badge)
- Add a shaded "profit zone" fill above the break-even point to visually emphasise the return

## Technical Detail

Triple-lock break-even calculation:
```
let cumulative = 0;
const annualPensionAtClaim = additionalAnnualPensionEUR * (1.035 ^ yearsUntilPension);
for (month = 1; month <= 300; month++) {
  cumulative += annualPensionAtClaim / 12;
  if (cumulative >= totalInvestmentEUR) return month;
}
```

This gives the realistic break-even because pension is locked at claim-time rates (already triple-lock-inflated by the time they reach 67).

