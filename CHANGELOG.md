# Changelog

## milestone/explainable-ops-platform

Release scope:
- `investment-dashboard`
- `investment-admin`
- `investment-api`

Highlights:
- Dashboard now presents a more explainable information surface for news, signals, and threshold context.
- Signals are paired with thresholds, current values, priorities, and tags so the action rationale is easier to read.
- Admin has been reshaped into a tighter operations console with grouped rule management, recent activity, and threshold controls.
- API now serves threshold config, live quote refresh, and Vercel-friendly routes for the admin workflow.
- Dashboard routing was corrected so admin navigation lands on the intended dashboard deployment.

Verification status:
- Production dashboard is live on `https://smart-trading-dashboard-gules.vercel.app`
- API settings endpoint is live on `https://smart-trading-api.vercel.app/settings`
- Admin production state still needs a final browser-level confirmation after redeploy, because the public curl probe for that domain did not return a body in this environment

Notes:
- The older `smart-trading-dashboard.vercel.app` domain should not be treated as the source of truth.
- The intended dashboard target is the `gules` deployment.
