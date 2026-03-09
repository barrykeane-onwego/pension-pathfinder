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
  calculatorResults?: {
    costEUR: number;
    breakEvenMonthsBuybackTripleLock: number;
    additionalAnnualPensionEUR: number;
    totalAdditionalAnnualPensionAtClaimEUR: number;
    totalInvestmentEUR: number;
    lifetimeROI10: number;
    lifetimeROI20: number;
    projectedPensionPercentage: number;
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
