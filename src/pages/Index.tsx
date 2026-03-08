import { useState, useMemo } from "react";
import HeroSection from "@/components/HeroSection";
import CalculatorInputsSection from "@/components/CalculatorInputs";
import ResultsDashboard from "@/components/ResultsDashboard";
import PensionChart from "@/components/PensionChart";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { calculatePension, type CalculatorInputs } from "@/lib/pension-calculator";
import { ExternalLink } from "lucide-react";

const Index = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentYears: 10,
    yearsToBuyBack: 3,
    contributionClass: "class2",
    currentAge: 45,
    retirementAge: 67,
  });

  const results = useMemo(() => calculatePension(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="container max-w-4xl px-4 py-10 space-y-10">
        <CalculatorInputsSection inputs={inputs} onChange={setInputs} />
        <ResultsDashboard results={results} yearsToBuyBack={inputs.yearsToBuyBack} currentYears={inputs.currentYears} />
        <PensionChart results={results} yearsToBuyBack={inputs.yearsToBuyBack} />
        <LeadCaptureForm calculatorInputs={inputs} />

        {/* Trust footer */}
        <footer className="text-center text-xs text-muted-foreground pb-8 space-y-2">
          <p>
            Calculations based on 2024/25 HMRC rates. Exchange rate: £1 = €1.17 (approximate).
            Projections include estimated triple lock growth (~3.5%/year).
          </p>
          <p>
            Source:{" "}
            <a
              href="https://www.gov.uk/voluntary-national-insurance-contributions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              gov.uk <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
          <p className="pt-2 opacity-70">
            © {new Date().getFullYear()} GetStatePension.com — All rights reserved
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
