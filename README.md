# Vehicle Care System v1

A mobile-first starter app for ordinary UK vehicle owners.

This is **not** a generic car admin tracker. The code keeps legal compliance, maintenance, tyre condition, symptoms, garage evidence, owner checklists, documents, and whole-vehicle status as separate but connected domains.

## What this starter includes

- Vehicle profile and multi-vehicle support
- Dashboard with component health map
- MOT history and manual recall register
- Maintenance rules with date, mileage, and whichever-comes-first logic
- Completed service logging that updates rule history
- Tyre module with per-wheel tread and pressure tracking
- Monthly and winter checklist workflows
- Equipment advisor with owned-kit tracking
- Symptom logging and garage visit history
- Documents vault with renewal reminders
- Local browser persistence using `localStorage`

## How to run

### Easiest route

Open `index.html` in a browser.

### If your browser blocks local file behaviour

Run a tiny local server from this folder, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html` — app shell
- `styles.css` — mobile-first styling
- `app.bundle.js` — dependency-free runnable build
- `src/` — readable modular source files

## Important design choices

### 1. Status model

The app uses:

- Green = healthy / on track
- Amber = due soon / monitor
- Red = action required
- Critical = unsafe / legal risk / do not drive
- Grey = unknown / not yet checked

### 2. MOT is not service history

MOT records, maintenance rules, symptom logs, and recalls are stored separately.

### 3. Threshold logic

The tyre model distinguishes between:

- legal minimum
- replacement planning threshold
- normal healthy range

### 4. Evidence-first records

Garage visits preserve:

- findings
- diagnosis
- recommended work
- completed work
- declined work
- follow-up dates
- costs

## Recommended next build steps

1. Replace `localStorage` with a real backend and auth.
2. Add attachment upload for invoices, photos, PDFs, MOT certificates, and quotes.
3. Add official UK integrations for MOT history and recall lookup.
4. Add push notifications and digest scheduling.
5. Add export packs for resale, warranty-end review, and annual spend summaries.
6. Split the component detail panel into dedicated mobile screens.
7. Add valuation APIs and richer ownership timeline analytics.

## Suggested production architecture

- Front end: React / Next.js or React Native / Expo
- Backend: Postgres + API layer
- Storage: object storage for invoices, PDFs, and images
- Notifications: push + email digests
- Rules engine: shared domain layer so status logic is consistent across mobile and backend jobs

## Notes

This v1 is intentionally opinionated around your spec:

- UK-first
- ordinary owners, not workshops
- vehicle care, not aesthetics
- evidence and condition over vague reminders
