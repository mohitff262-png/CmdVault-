# Deployment

```bash
npm ci && npm run build && npm start   # port 3000; set PORT to change
```
Put nginx or a platform proxy in front for TLS. The in-memory rate limiter is per-process; use a shared store for multi-instance deployments. Review `privacy` and `terms` templates before going public.
