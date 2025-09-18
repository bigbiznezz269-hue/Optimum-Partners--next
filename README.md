# Optimum Partners LLC — Lead Generation Site (Starter)

This is a **static, mobile‑friendly lead-gen site** with a simple **chat widget placeholder** that also captures leads.

## Quick Start (Vercel)

1. Push these files to your GitHub repo (e.g., `optimum-partners-leads`).
2. Go to **Vercel** → **New Project** → import your repo.
3. Build settings: *Static Site* (no framework needed). Just deploy.

Your site will be live on a vercel.app URL, and you can add a custom domain later.

## Lead Form (No-Backend)

The form is configured for Formspree. In `index.html`, change:

```
<form action="https://formspree.io/f/your_form_id" method="POST">
```

Replace `your_form_id` with your Formspree form endpoint (free).

## Chat Bot Placeholder

The floating chat widget collects **name, service, phone** and sends it to the same endpoint (if configured). It also saves a backup to `localStorage` in case offline.

Later, replace it with your preferred provider (Crisp, Tidio, Intercom) or a custom API.

## Customize

- Update phone number, service areas, and copy in `index.html`.
- Colors/spacing are in `styles.css`.
- Behavior in `script.js`.
- Favicon/logo is in `assets/logo.svg`.

## Suggested Next Steps

- Connect a custom domain in Vercel
- Add analytics (Vercel Analytics or Plausible)
- Replace placeholder bot with a real provider
- Add privacy/terms pages
