# UK State Pension Buyback Calculator — Architecture Review

## Review Prompt for Claude

Review this UK State Pension buyback calculator for Irish expats. Check:

1. **Pension math**: Triple-lock (3.5% annual), Class 2 vs Class 3 rates (£3.45/wk vs £17.45/wk), break-even calculations
2. **Break-even logic**: Does the triple-lock break-even correctly compare cumulative earnings at claim-time rates vs total investment?
3. **CRM integration**: Lead capture fields + callback scheduler data structure — is this ready for Close CRM API payload?
4. **Edge cases**: What happens with 0 years buyback, already at 35 years, age > pension age?
5. **Example scenario**: 45yo, 20 current NI years, buying back 6 gap years (Class 2), continuing at Class 3 for 9 more years to reach 35. Does break-even show ~1 year?

---

## File 1: src/lib/pension-calculator.ts

```typescript
// 2025/26 rates
export const CLASS_2_WEEKLY = 3.45; // GBP per week
export const CLASS_3_WEEKLY = 17.45; // GBP per week
export const WEEKS_PER_YEAR = 52;
export const FULL_PENSION_WEEKLY_GBP = 221.20; // 2024/25 full new state pension
export const FULL_PENSION_YEARS = 35;
export const GBP_TO_EUR = 1.17; // approximate rate

// Triple lock: average ~3.5% annual increase historically
export const TRIPLE_LOCK_RATE = 0.035;

export const UK_STATE_PENSION_AGE = 67;

export interface CalculatorInputs {
  currentYears: number;
  yearsToBuyBack: number;
  contributionClass: "class2" | "class3";
  currentAge: number;
  retirementAge: number;
}

export interface CalculatorResults {
  costGBP: number;
  costEUR: number;
  costClass3GBP: number;
  costClass3EUR: number;
  additionalWeeklyPensionGBP: number;
  additionalAnnualPensionGBP: number;
  additionalAnnualPensionEUR: number;
  breakEvenMonths: number;
  breakEvenMonthsTripleLock: number;
  breakEvenMonthsBuybackTripleLock: number;
  yearsUntilPension: number;
  retirementDuration: number;
  lifetimeROI10: number;
  lifetimeROI20: number;
  savingsVsClass3EUR: number;
  savingsPercentage: number;
  // Future contribution fields
  totalYearsAfterBuyback: number;
  yearsStillNeeded: number;
  futureYearsToContribute: number;
  futureContributionCostGBP: number;
  futureContributionCostEUR: number;
  totalInvestmentGBP: number;
  totalInvestmentEUR: number;
  projectedTotalYears: number;
  projectedPensionPercentage: number;
  projectedWeeklyPensionGBP: number;
  // Total additional years (buyback + future)
  totalAdditionalYears: number;
  totalAdditionalAnnualPensionEUR: number;
  totalAdditionalAnnualPensionAtClaimEUR: number;
  chartData: { year: number; cumulativeEarnings: number; cost: number; cumulativeEarningsTripleLock: number }[];
}

export function calculatePension(inputs: CalculatorInputs): CalculatorResults {
  const { currentYears, yearsToBuyBack, contributionClass, currentAge, retirementAge } = inputs;

  const weeklyRate = contributionClass === "class2" ? CLASS_2_WEEKLY : CLASS_3_WEEKLY;
  const costPerYear = weeklyRate * WEEKS_PER_YEAR;
  const costGBP = costPerYear * yearsToBuyBack;
  const costEUR = costGBP * GBP_TO_EUR;

  const costClass3GBP = CLASS_3_WEEKLY * WEEKS_PER_YEAR * yearsToBuyBack;
  const costClass3EUR = costClass3GBP * GBP_TO_EUR;

  // Each qualifying year = 1/35th of full pension (buyback only)
  const additionalWeeklyPensionGBP = (FULL_PENSION_WEEKLY_GBP / FULL_PENSION_YEARS) * yearsToBuyBack;
  const additionalAnnualPensionGBP = additionalWeeklyPensionGBP * WEEKS_PER_YEAR;
  const additionalAnnualPensionEUR = additionalAnnualPensionGBP * GBP_TO_EUR;

  // Flat break-even (buyback only, no triple lock)
  const breakEvenMonths = additionalAnnualPensionEUR > 0
    ? Math.ceil((costEUR / additionalAnnualPensionEUR) * 12)
    : 0;

  const pensionAge = Math.max(retirementAge, UK_STATE_PENSION_AGE);
  const yearsUntilPension = Math.max(0, pensionAge - currentAge);
  const retirementDuration = Math.max(0, 90 - pensionAge);

  // Future contribution calculations
  const totalYearsAfterBuyback = currentYears + yearsToBuyBack;
  const yearsStillNeeded = Math.max(0, FULL_PENSION_YEARS - totalYearsAfterBuyback);
  const futureYearsContributable = Math.max(0, pensionAge - currentAge);
  const futureYearsToContribute = Math.min(yearsStillNeeded, futureYearsContributable);
  const futureContributionCostGBP = futureYearsToContribute * CLASS_3_WEEKLY * WEEKS_PER_YEAR;
  const futureContributionCostEUR = futureContributionCostGBP * GBP_TO_EUR;
  const totalInvestmentGBP = costGBP + futureContributionCostGBP;
  const totalInvestmentEUR = costEUR + futureContributionCostEUR;
  const projectedTotalYears = Math.min(FULL_PENSION_YEARS, currentYears + yearsToBuyBack + futureYearsToContribute);
  const projectedPensionPercentage = projectedTotalYears / FULL_PENSION_YEARS;
  const projectedWeeklyPensionGBP = FULL_PENSION_WEEKLY_GBP * projectedPensionPercentage;

  // Total additional years and pension (buyback + future)
  const totalAdditionalYears = yearsToBuyBack + futureYearsToContribute;
  const totalAdditionalWeeklyGBP = (FULL_PENSION_WEEKLY_GBP / FULL_PENSION_YEARS) * totalAdditionalYears;
  const totalAdditionalAnnualPensionEUR = totalAdditionalWeeklyGBP * WEEKS_PER_YEAR * GBP_TO_EUR;

  // Triple-lock-adjusted annual pension at claim time
  const tripleLockMultiplier = Math.pow(1 + TRIPLE_LOCK_RATE, yearsUntilPension);
  const totalAdditionalAnnualPensionAtClaimEUR = totalAdditionalAnnualPensionEUR * tripleLockMultiplier;
  const buybackAnnualPensionAtClaimEUR = additionalAnnualPensionEUR * tripleLockMultiplier;

  // Triple-lock break-even: total investment vs total additional pension at claim rates
  let breakEvenMonthsTripleLock = 0;
  if (totalAdditionalAnnualPensionAtClaimEUR > 0) {
    let cum = 0;
    for (let m = 1; m <= 600; m++) {
      cum += totalAdditionalAnnualPensionAtClaimEUR / 12;
      if (cum >= totalInvestmentEUR) {
        breakEvenMonthsTripleLock = m;
        break;
      }
    }
  }

  // Triple-lock break-even: buyback only cost vs buyback pension at claim rates
  let breakEvenMonthsBuybackTripleLock = 0;
  if (buybackAnnualPensionAtClaimEUR > 0) {
    let cum = 0;
    for (let m = 1; m <= 600; m++) {
      cum += buybackAnnualPensionAtClaimEUR / 12;
      if (cum >= costEUR) {
        breakEvenMonthsBuybackTripleLock = m;
        break;
      }
    }
  }

  // Lifetime ROI with triple lock
  const calcROI = (years: number) => {
    let total = 0;
    for (let i = 0; i < years; i++) {
      total += totalAdditionalAnnualPensionEUR * Math.pow(1 + TRIPLE_LOCK_RATE, yearsUntilPension + i);
    }
    return total;
  };

  const lifetimeROI10 = calcROI(10);
  const lifetimeROI20 = calcROI(20);

  const savingsVsClass3EUR = costClass3EUR - costEUR;
  const savingsPercentage = costClass3EUR > 0 ? (savingsVsClass3EUR / costClass3EUR) * 100 : 0;

  // Chart data: uses total additional pension (buyback + future) vs total investment
  const chartData = [];
  let cumEarnings = 0;
  let cumEarningsTripleLock = 0;
  for (let y = 0; y <= 25; y++) {
    cumEarnings += totalAdditionalAnnualPensionEUR;
    cumEarningsTripleLock += totalAdditionalAnnualPensionAtClaimEUR;
    chartData.push({
      year: y,
      cumulativeEarnings: Math.round(cumEarnings),
      cost: Math.round(totalInvestmentEUR),
      cumulativeEarningsTripleLock: Math.round(cumEarningsTripleLock),
    });
  }

  return {
    costGBP,
    costEUR,
    costClass3GBP,
    costClass3EUR,
    additionalWeeklyPensionGBP,
    additionalAnnualPensionGBP,
    additionalAnnualPensionEUR,
    breakEvenMonths,
    breakEvenMonthsTripleLock,
    breakEvenMonthsBuybackTripleLock,
    yearsUntilPension,
    retirementDuration,
    lifetimeROI10,
    lifetimeROI20,
    savingsVsClass3EUR,
    savingsPercentage,
    totalYearsAfterBuyback,
    yearsStillNeeded,
    futureYearsToContribute,
    futureContributionCostGBP,
    futureContributionCostEUR,
    totalInvestmentGBP,
    totalInvestmentEUR,
    projectedTotalYears,
    projectedPensionPercentage,
    projectedWeeklyPensionGBP,
    totalAdditionalYears,
    totalAdditionalAnnualPensionEUR,
    totalAdditionalAnnualPensionAtClaimEUR,
    chartData,
  };
}
```

---

## File 2: src/components/ResultsDashboard.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, PiggyBank, AlertTriangle, Target, Zap } from "lucide-react";
import type { CalculatorResults } from "@/lib/pension-calculator";

const fmt = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const fmtGBP = (n: number) => `£${n.toFixed(0)}`;

interface Props {
  results: CalculatorResults;
  yearsToBuyBack: number;
  currentYears: number;
}

const ResultsDashboard = ({ results, yearsToBuyBack, currentYears }: Props) => {
  if (yearsToBuyBack === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Move the "Years to buy back" slider above to see your results.</p>
        </CardContent>
      </Card>
    );
  }

  const afterBuybackPercent = (results.totalYearsAfterBuyback / 35) * 100;
  const currentPercent = (currentYears / 35) * 100;

  const breakEvenTLYears = Math.floor(results.breakEvenMonthsTripleLock / 12);
  const breakEvenTLMonths = results.breakEvenMonthsTripleLock % 12;

  const breakEvenBuybackYears = Math.floor(results.breakEvenMonthsBuybackTripleLock / 12);
  const breakEvenBuybackMonths = results.breakEvenMonthsBuybackTripleLock % 12;

  const fmtBreakEven = (years: number, months: number) => {
    if (years === 0 && months === 0) return "N/A";
    if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
    return `${years}y ${months}m`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif">Your Results</h2>

      {/* Triple-Lock Break-Even — Hero Card */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Triple-Lock Break-Even
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground mb-1">Buyback only</p>
              <p className="text-3xl font-bold text-primary">
                {fmtBreakEven(breakEvenBuybackYears, breakEvenBuybackMonths)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fmt(results.costEUR)} cost → {fmt(results.additionalAnnualPensionEUR * Math.pow(1.035, results.yearsUntilPension))}/yr at claim
              </p>
            </div>
            <div className="rounded-lg bg-accent/10 p-4">
              <p className="text-xs text-muted-foreground mb-1">Total journey (buyback + future)</p>
              <p className="text-3xl font-bold">
                {fmtBreakEven(breakEvenTLYears, breakEvenTLMonths)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fmt(results.totalInvestmentEUR)} invested → {fmt(results.totalAdditionalAnnualPensionAtClaimEUR)}/yr at claim
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your pension income is set at <strong>triple-lock-adjusted rates</strong> when you claim at age {Math.max(results.yearsUntilPension + 45, 67)}. 
            With ~3.5% annual growth, your pension at claim will be significantly higher than today's rates.
          </p>
        </CardContent>
      </Card>

      {/* Full Pension Journey Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Pension Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative">
              <Progress value={afterBuybackPercent} className="h-5" />
              <div
                className="absolute top-0 h-5 border-r-2 border-dashed border-muted-foreground/50"
                style={{ left: `${currentPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentYears} current + {yearsToBuyBack} buyback = <strong className="text-foreground">{results.totalYearsAfterBuyback} years</strong></span>
              <span>35 target</span>
            </div>
          </div>

          {/* Cost breakdown */}
          {results.yearsStillNeeded > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To reach full pension ({results.yearsStillNeeded} more years needed):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-md bg-primary/10 p-3">
                  <p className="text-xs text-muted-foreground">Past buyback (Class 2)</p>
                  <p className="text-lg font-bold text-primary">{fmt(results.costEUR)}</p>
                  <p className="text-xs text-primary font-medium">⚡ Act before Apr 2026</p>
                </div>
                <div className="rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Future contributions (Class 3)</p>
                  <p className="text-lg font-bold">{fmt(results.futureContributionCostEUR)}</p>
                  <p className="text-xs text-muted-foreground">{results.futureYearsToContribute} years × {fmt(results.futureContributionCostEUR / Math.max(1, results.futureYearsToContribute))}/yr</p>
                </div>
                <div className="rounded-md bg-accent/10 p-3">
                  <p className="text-xs text-muted-foreground">Total investment</p>
                  <p className="text-lg font-bold">{fmt(results.totalInvestmentEUR)}</p>
                  <p className="text-xs text-muted-foreground">{fmtGBP(results.totalInvestmentGBP)} GBP</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-primary font-medium">
              ✓ You'll reach full pension qualification with this buyback!
            </p>
          )}

          {/* Projected pension */}
          <div className="rounded-md bg-card border p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projected pension</span>
            <span className="text-right">
              <span className="font-bold text-lg">{(results.projectedPensionPercentage * 100).toFixed(0)}%</span>
              <span className="text-sm text-muted-foreground ml-2">({fmtGBP(results.projectedWeeklyPensionGBP)}/week)</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <PiggyBank className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Buyback cost (Class 2)</p>
                <p className="text-2xl font-bold">{fmt(results.costEUR)}</p>
                <p className="text-xs text-muted-foreground mt-1">{fmtGBP(results.costGBP)} GBP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Additional annual pension</p>
                <p className="text-2xl font-bold">{fmt(results.totalAdditionalAnnualPensionAtClaimEUR)}</p>
                <p className="text-xs text-muted-foreground mt-1">at claim (triple-lock adjusted)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Break-even (flat rates)</p>
                <p className="text-2xl font-bold">
                  {Math.floor(results.breakEvenMonths / 12) > 0 && `${Math.floor(results.breakEvenMonths / 12)}y `}{results.breakEvenMonths % 12}m
                </p>
                <p className="text-xs text-muted-foreground mt-1">buyback only, no growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Lifetime return</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-lg font-bold">{fmt(results.lifetimeROI10)}</p>
                    <p className="text-xs text-muted-foreground">over 10 years</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{fmt(results.lifetimeROI20)}</p>
                    <p className="text-xs text-muted-foreground">over 20 years</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison panel */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            What if you wait until after April 2026?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            From April 2026, only Class 3 contributions (£17.45/week) will be available for people abroad — that's <strong>5× more expensive</strong> than Class 2.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Class 3 cost would be</p>
              <p className="text-xl font-bold text-foreground">{fmt(results.costClass3EUR)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You save by acting now</p>
              <p className="text-xl font-bold text-primary">{fmt(results.savingsVsClass3EUR)}</p>
              <p className="text-xs text-primary font-medium">{results.savingsPercentage.toFixed(0)}% cheaper</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
```

---

## File 3: src/components/PensionChart.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import type { CalculatorResults } from "@/lib/pension-calculator";

const fmt = (n: number) => `€${(n / 1000).toFixed(0)}k`;

interface Props {
  results: CalculatorResults;
  yearsToBuyBack: number;
}

const PensionChart = ({ results, yearsToBuyBack }: Props) => {
  if (yearsToBuyBack === 0) return null;

  // Find break-even year using triple-lock earnings
  const breakEvenYear = results.chartData.find(
    (d) => d.cumulativeEarningsTripleLock >= d.cost
  )?.year;

  const maxYear = results.chartData[results.chartData.length - 1]?.year ?? 25;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Cumulative Return Over Retirement</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows your cumulative pension earnings vs total investment, including projected triple-lock growth at claim time.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 90%)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                label={{ value: "Years in retirement", position: "insideBottom", offset: -5, fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={fmt} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `€${value.toLocaleString()}`,
                  name === "cumulativeEarningsTripleLock"
                    ? "Earnings (triple lock)"
                    : name === "cumulativeEarnings"
                    ? "Earnings (flat)"
                    : "Total investment",
                ]}
                labelFormatter={(label) => `Year ${label}`}
              />
              {/* Profit zone: shaded area after break-even */}
              {breakEvenYear !== undefined && (
                <ReferenceArea
                  x1={breakEvenYear}
                  x2={maxYear}
                  fill="hsl(174 62% 32% / 0.08)"
                  strokeOpacity={0}
                />
              )}
              <Area
                type="monotone"
                dataKey="cost"
                stroke="hsl(0 84% 60%)"
                fill="hsl(0 84% 60% / 0.1)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="cumulativeEarnings"
                stroke="hsl(210 20% 70%)"
                fill="hsl(210 20% 70% / 0.05)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="cumulativeEarningsTripleLock"
                stroke="hsl(174 62% 32%)"
                fill="hsl(174 62% 32% / 0.1)"
                strokeWidth={2}
                dot={false}
              />
              {breakEvenYear !== undefined && (
                <ReferenceLine
                  x={breakEvenYear}
                  stroke="hsl(174 62% 32%)"
                  strokeDasharray="3 3"
                  label={{
                    value: `Break-even: Year ${breakEvenYear}`,
                    position: "top",
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "hsl(174 62% 32%)",
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Earnings (triple lock)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" /> Earnings (flat)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Total investment
          </span>
          {breakEvenYear !== undefined && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary/20" /> Profit zone
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PensionChart;
```

---

## File 4: src/components/LeadCaptureForm.tsx

```tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Shield, Phone, MessageCircle, CheckCircle2, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";

interface Props {
  calculatorInputs: {
    currentYears: number;
    yearsToBuyBack: number;
    contributionClass: string;
    currentAge: number;
    retirementAge: number;
  };
}

const LeadCaptureForm = ({ calculatorInputs }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    ukWorkingYears: "",
    knowsNINumber: false,
    yearLeftUK: "",
    wantsChat: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Please enter your name and email", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Send to Close CRM via edge function
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      toast({ title: "Thank you! We'll be in touch shortly." });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Callback scheduler state
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Map<string, Set<string>>>(new Map());
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);

  const next7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i + 1);
      return {
        date: format(d, "yyyy-MM-dd"),
        label: format(d, "EEE d MMM"),
      };
    });
  }, []);

  const toggleDay = (date: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
        setSelectedSlots((s) => { const m = new Map(s); m.delete(date); return m; });
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const toggleSlot = (date: string, slot: string) => {
    setSelectedSlots((prev) => {
      const m = new Map(prev);
      const slots = new Set(m.get(date) || []);
      if (slots.has(slot)) slots.delete(slot);
      else slots.add(slot);
      m.set(date, slots);
      return m;
    });
  };

  const handleCallbackSubmit = async () => {
    const preferences = Array.from(selectedDays).map((date) => ({
      date,
      dateLabel: next7Days.find((d) => d.date === date)?.label || date,
      slots: Array.from(selectedSlots.get(date) || []),
    })).filter((p) => p.slots.length > 0);

    if (preferences.length === 0) {
      toast({ title: "Please select at least one day and time slot", variant: "destructive" });
      return;
    }

    setCallbackSubmitting(true);
    try {
      // TODO: Send to Close CRM via edge function
      console.log("Callback preferences:", preferences);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCallbackSubmitted(true);
      toast({ title: "Callback requested — we'll be in touch!" });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setCallbackSubmitting(false);
    }
  };

  const timeSlots = [
    { id: "morning", label: "Morning (9–12)" },
    { id: "afternoon", label: "Afternoon (12–5)" },
    { id: "evening", label: "Evening (5–8)" },
  ];

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-teal-light">
        <CardContent className="py-10 space-y-6">
          {/* Thank You Header */}
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-serif mb-2">Thank You!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our team at GetStatePension.com will review your details and be in touch within 24 hours.
            </p>
          </div>

          {/* Direct Contact Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="lg" asChild>
              <a href="tel:+35312337558" className="gap-2">
                <Phone className="h-4 w-4" />
                +353 1 233 7558
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="whatsapp://send?phone=447400440290" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Request a callback / Chat on WhatsApp
              </a>
            </Button>
          </div>

          <Separator />

          {/* Callback Scheduler */}
          {callbackSubmitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium">Callback requested</p>
              <p className="text-sm text-muted-foreground">We'll be in touch at your preferred times.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-serif text-lg font-medium">Request a Callback</h4>
              </div>

              {/* Day Chips */}
              <div className="flex flex-wrap gap-2">
                {next7Days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => toggleDay(day.date)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedDays.has(day.date)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-accent"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Time Slots per Selected Day */}
              {Array.from(selectedDays).sort().map((date) => {
                const dayLabel = next7Days.find((d) => d.date === date)?.label;
                const activeSlots = selectedSlots.get(date) || new Set();
                return (
                  <div key={date} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{dayLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlot(date, slot.id)}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            activeSlots.has(slot.id)
                              ? "bg-accent text-accent-foreground border-primary"
                              : "bg-background text-foreground border-input hover:bg-accent"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {selectedDays.size > 0 && (
                <Button onClick={handleCallbackSubmit} disabled={callbackSubmitting} className="w-full">
                  {callbackSubmitting ? "Sending..." : "Request Callback"}
                </Button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Your data is secure and will only be used to prepare your pension report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Get Your Personalised UK State Pension Report</CardTitle>
        <CardDescription className="text-base">
          Our experts at GetStatePension.com will review your situation and guide you through the HMRC process — before the April 2026 deadline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Murphy" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+353 ..." maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="e.g. Software Engineer" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ukWorkingYears">UK Working Years</Label>
              <Input id="ukWorkingYears" value={form.ukWorkingYears} onChange={(e) => update("ukWorkingYears", e.target.value)} placeholder="e.g. 8" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearLeftUK">Year You Left the UK</Label>
              <Input id="yearLeftUK" value={form.yearLeftUK} onChange={(e) => update("yearLeftUK", e.target.value)} placeholder="e.g. 2015" maxLength={4} />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Switch id="niNumber" checked={form.knowsNINumber} onCheckedChange={(v) => update("knowsNINumber", v)} />
              <Label htmlFor="niNumber" className="cursor-pointer">I know my NI number</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="wantsChat" checked={form.wantsChat} onCheckedChange={(v) => update("wantsChat", v)} />
              <Label htmlFor="wantsChat" className="cursor-pointer">
                I want a quick chat to clarify next steps before the April 5th 2026 deadline
              </Label>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Get My Free Report"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Your data is secure and will only be used to prepare your pension report.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCaptureForm;
```

---

## CRM Data Structures

### Lead Capture Payload
```json
{
  "name": "John Murphy",
  "email": "john@example.com",
  "phone": "+353 87 123 4567",
  "jobTitle": "Software Engineer",
  "ukWorkingYears": "8",
  "knowsNINumber": true,
  "yearLeftUK": "2015",
  "wantsChat": true,
  "calculatorInputs": {
    "currentYears": 20,
    "yearsToBuyBack": 6,
    "contributionClass": "class2",
    "currentAge": 45,
    "retirementAge": 67
  }
}
```

### Callback Preferences Payload
```json
{
  "callbackPreferences": [
    {
      "date": "2026-03-10",
      "dateLabel": "Mon 10 Mar",
      "slots": ["morning", "afternoon"]
    },
    {
      "date": "2026-03-12",
      "dateLabel": "Wed 12 Mar",
      "slots": ["evening"]
    }
  ]
}
```

---

## Key Questions for Review

1. Is the triple-lock multiplier `(1.035)^yearsUntilPension` correctly applied to project pension value at claim time?
2. Should the chart's earnings line start at year 0 or year 1 of retirement?
3. For the CRM payload, should calculator results (costEUR, breakEvenMonths, etc.) be included alongside user inputs?
4. Are there any UK pension rules that would invalidate this calculation approach?
