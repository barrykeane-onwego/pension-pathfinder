# Enhanced Thank You Screen — Contact, WhatsApp, and Callback Scheduler

## What Changes

The current "Thank You" state in `LeadCaptureForm.tsx` (lines 59-72) is a simple confirmation message. We will replace it with a rich post-submission experience containing three sections:

---

## 1. Direct Contact Options

Two prominent, tappable buttons:

- **Call Us**: `tel:+35312337558` — displays as "+353 1 233 7558" with a Phone icon. Clickable link that opens the dialler on mobile.
- **WhatsApp Us**: `whatsapp://send?phone=447400440290` — displays"Requeat a callback/Chat on WhatsApp" with a MessageCircle icon. Opens WhatsApp on mobile/desktop.

Both styled as outlined buttons side-by-side (stacking vertically on mobile).

---

## 2. Request a Callback Scheduler

An interactive day/time picker below the contact buttons:

- **Day selection**: Show the next 7 calendar days (e.g., "Mon 3 Mar", "Tue 4 Mar", ...). Each day is a selectable chip/toggle. Multiple days can be selected.
- **Time slot selection**: Three toggle options per selected concept — "Morning (9-12)", "Afternoon (12-5)", "Evening (5-8)". Multiple slots can be selected across multiple days.
- **Data structure**: Array of `{ date: string (ISO), slots: ("morning" | "afternoon" | "evening")[] }` — sent alongside the lead data to Close CRM.
- **Submit button**: "Request Callback" — sends the callback preferences. Shows a confirmation inline once submitted.

The UI uses the existing ToggleGroup component for time slots and simple toggle chips for days to keep it lightweight.

---

## 3. Confirmation Flow

- Initially shows the contact options + callback scheduler
- After submitting callback preferences, the scheduler section collapses into a confirmation: "Callback requested — we'll be in touch at your preferred times"
- Contact buttons remain visible throughout

---

## Technical Details

### Files Modified

`**src/components/LeadCaptureForm.tsx**`:

- Replace the `submitted` return block (lines 59-72) with a new `ThankYouScreen` section
- Add state for callback selections: `callbackSlots` as `Map<string, Set<string>>`
- Add a `handleCallbackSubmit` function (currently logs/simulates, ready for CRM integration)
- Generate next 7 days using `date-fns` (already installed) with `addDays` and `format`
- Use `ToggleGroup` from existing UI components for time slot selection

### New Component Structure (within LeadCaptureForm)

```text
ThankYou Card
+-- "Thank You" heading + message
+-- Contact Buttons Row
|   +-- [Phone icon] Call Us  (tel: link)
|   +-- [WhatsApp icon] WhatsApp Us  (whatsapp: link)
+-- Separator
+-- Callback Scheduler
|   +-- "Request a Callback" heading
|   +-- Day chips (next 7 days, multi-select)
|   +-- Time slot toggles per selected day (Morning/Afternoon/Evening)
|   +-- [Submit] "Request Callback" button
+-- Privacy note
```

### Data for CRM

The callback data structure to be sent alongside existing lead data:

```typescript
interface CallbackPreference {
  date: string;        // e.g. "2026-03-04"
  dateLabel: string;   // e.g. "Tue 4 Mar"
  slots: string[];     // e.g. ["morning", "afternoon"]
}
```

This is ready to be included in the Close CRM edge function payload when that integration is built.

### Dependencies Used

- `date-fns` (already installed) — for `addDays`, `format`, `startOfDay`
- `lucide-react` (already installed) — `Phone`, `MessageCircle` icons
- Existing UI: `Button`, `Card`, `Badge` or toggle chips, `Separator`