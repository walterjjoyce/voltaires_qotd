# QOTD Signup Fix

Safe replacement for the public Voltaire's QOTD signup form.

## Problem
The current GitHub Pages form posts directly to Baserow with a hardcoded API token in client-side JavaScript. The token is dead, and even if refreshed, exposing a write token in public HTML is unsafe.

## Fix
- Static frontend remains public.
- Browser submits to a small serverless endpoint.
- Serverless endpoint uses `BASEROW_API_TOKEN` from environment variables.
- Endpoint writes to the `QOTD_contacts` table in Baserow.

## Files
- `index.html` — safe frontend that posts to `/api/signup`
- `api/signup.js` — Vercel serverless function
- `vercel.json` — minimal routing/CORS config
- `.env.example` — required env vars

## Required env vars
- `BASEROW_API_TOKEN`
- `BASEROW_BASE_URL` (optional, defaults to `https://api.baserow.io`)
- `BASEROW_QOTD_CONTACTS_TABLE_ID` (defaults to `889330`)

## Deploy
Typical path:
1. Create a repo for the site.
2. Deploy to Vercel.
3. Add the env vars in Vercel project settings.
4. Point the frontend form at the deployed domain.
5. Keep GitHub Pages only if you want, but the form action should target the Vercel API.

## Notes
- This avoids exposing secrets in the browser.
- It also allows validation, duplicate handling, and rate limiting later.
