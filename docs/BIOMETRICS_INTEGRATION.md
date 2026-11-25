# Vidog biometrics integration

The portal treats the Vidog model as a private loopback service. Use Node 20+ native `fetch`, `FormData`, and `fs.openAsBlob`; no multipart dependency is needed.

## Setup

Set `BIOMETRIC_ENABLED=true` and run `npm run mock:biometrics` for a local contract-compatible service. The portal sends registration to `${BIOMETRIC_SERVICE_URL}/api/v1/register` and checks `${BIOMETRIC_SERVICE_URL}/health`.

Create or edit a case with a nose and/or body video. The request returns immediately; the queue records `pending`, then `processing`, then `enrolled` with the model metadata. A photo submitted to `/api/biometrics/identify` is never persisted; the model case id is looked up in the portal database before results return.

Statuses are `none`, `pending`, `processing`, `enrolled`, and `failed`. The queue retries service/timeout/5xx failures up to `BIOMETRIC_MAX_ATTEMPTS`; model 400 responses fail immediately.

## Go-live checklist

- Bind the Python service to `127.0.0.1` only; do not use the handoff's `0.0.0.0` command. Firewall port 8000.
- Run it under PM2 or systemd separately from the portal backend (portal port 8082).
- Back up `data/gallery_v2/`; it is the only vector store. Keep case folders in sync on case deletion until a model delete endpoint exists.
- Raise Nginx `client_max_body_size` or Apache `LimitRequestBody` to at least the portal's 300MB upload limit.
- Run `POST /api/biometrics/re-enroll-all` once after enablement to backfill video-bearing cases.

Open questions for the model owner: whether delete is available, whether registration is idempotent, whether replacing one stream retains the other, and the maximum supported video length.
