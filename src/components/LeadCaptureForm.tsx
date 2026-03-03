import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Shield } from "lucide-react";

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

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-teal-light">
        <CardContent className="py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-serif mb-2">Thank You!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our team at GetStatePension.com will review your details and be in touch within 24 hours to discuss your next steps.
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
