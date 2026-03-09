import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, PiggyBank, AlertTriangle, Target, Zap, Info } from "lucide-react";
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

      {/* 10-year minimum warning */}
      {results.belowMinimumYears && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Minimum 10 years required</AlertTitle>
          <AlertDescription>
            You need at least 10 qualifying NI years to receive any UK state pension. 
            With {currentYears + yearsToBuyBack} years, you wouldn't yet qualify. Consider buying back more years or planning future contributions.
          </AlertDescription>
        </Alert>
      )}

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
            Pension income is shown at <strong>triple-lock-adjusted rates</strong> (conservative 3.5%/yr estimate) when you claim at age {Math.max(results.yearsUntilPension + 45, 67)}. 
            The triple lock is a government policy commitment, not a legal guarantee — actual increases may vary.
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
