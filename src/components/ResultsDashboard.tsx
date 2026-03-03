import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, PiggyBank, AlertTriangle } from "lucide-react";
import type { CalculatorResults } from "@/lib/pension-calculator";

const fmt = (n: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

interface Props {
  results: CalculatorResults;
  yearsToBuyBack: number;
}

const ResultsDashboard = ({ results, yearsToBuyBack }: Props) => {
  if (yearsToBuyBack === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Move the "Years to buy back" slider above to see your results.</p>
        </CardContent>
      </Card>
    );
  }

  const breakEvenYears = Math.floor(results.breakEvenMonths / 12);
  const breakEvenRemainder = results.breakEvenMonths % 12;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif">Your Results</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <PiggyBank className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Total cost to buy back</p>
                <p className="text-2xl font-bold">{fmt(results.costEUR)}</p>
                <p className="text-xs text-muted-foreground mt-1">£{results.costGBP.toFixed(0)} GBP</p>
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
                <p className="text-2xl font-bold">{fmt(results.additionalAnnualPensionEUR)}</p>
                <p className="text-xs text-muted-foreground mt-1">£{results.additionalAnnualPensionGBP.toFixed(0)}/year GBP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-light border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Break-even point</p>
                <p className="text-2xl font-bold">
                  {breakEvenYears > 0 && `${breakEvenYears}y `}{breakEvenRemainder}m
                </p>
                <p className="text-xs text-muted-foreground mt-1">of receiving pension</p>
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
