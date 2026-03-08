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
