import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CalculatorInputs as Inputs } from "@/lib/pension-calculator";

interface Props {
  inputs: Inputs;
  onChange: (inputs: Inputs) => void;
}

const CalculatorInputsSection = ({ inputs, onChange }: Props) => {
  const update = (partial: Partial<Inputs>) => onChange({ ...inputs, ...partial });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Current qualifying years */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Current qualifying years on NI record
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline h-3.5 w-3.5 ml-1.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Check your NI record at gov.uk to find your qualifying years.
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="text-2xl font-bold text-primary tabular-nums">{inputs.currentYears}</span>
          </div>
          <Slider
            value={[inputs.currentYears]}
            onValueChange={([v]) => update({ currentYears: v })}
            min={0}
            max={35}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 years</span>
            <span>35 years (full pension)</span>
          </div>
        </div>

        {/* Years to buy back */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Years eligible to buy back
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline h-3.5 w-3.5 ml-1.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Under the normal 6-year lookback rule, you can buy back up to 6 years.
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="text-2xl font-bold text-primary tabular-nums">{inputs.yearsToBuyBack}</span>
          </div>
          <Slider
            value={[inputs.yearsToBuyBack]}
            onValueChange={([v]) => update({ yearsToBuyBack: v })}
            min={0}
            max={6}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 years</span>
            <span>6 years (max lookback)</span>
          </div>
        </div>

        {/* Contribution class */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Eligible for Class 2 contributions?
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="inline h-3.5 w-3.5 ml-1.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Class 2 (£3.45/week) is available if you worked in the UK before moving abroad and are currently employed/self-employed. Class 3 costs £17.45/week — 5x more.
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={inputs.contributionClass === "class2"}
              onCheckedChange={(checked) =>
                update({ contributionClass: checked ? "class2" : "class3" })
              }
            />
            <span className="text-sm">
              {inputs.contributionClass === "class2" ? (
                <span className="text-primary font-medium">Class 2 — £3.45/week</span>
              ) : (
                <span className="text-muted-foreground">Class 3 — £17.45/week</span>
              )}
            </span>
          </div>
        </div>

        {/* Age inputs */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Current age</Label>
              <span className="text-2xl font-bold text-primary tabular-nums">{inputs.currentAge}</span>
            </div>
            <Slider
              value={[inputs.currentAge]}
              onValueChange={([v]) => update({ currentAge: v })}
              min={30}
              max={70}
              step={1}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Retirement age</Label>
              <span className="text-2xl font-bold text-primary tabular-nums">{inputs.retirementAge}</span>
            </div>
            <Slider
              value={[inputs.retirementAge]}
              onValueChange={([v]) => update({ retirementAge: v })}
              min={60}
              max={75}
              step={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorInputsSection;
