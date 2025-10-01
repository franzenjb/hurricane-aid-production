Project: Community Hurricane & Flood Aid – Requests, Volunteers, and Resources Map
Goal

Enable residents to submit help requests (food/water, muck-outs, debris removal, etc.), allow staff/volunteers to enter requests from phone/email, see requests on a live map with photos/status, locate volunteers and resources, and send targeted alerts (radius-based) about nearby aid (e.g., open shelter, food kitchen, equipment drops). Must be free or near-free, simple to use, and deployable quickly.

Non-Negotiables (MVP)

Request Intake (multi-channel):

Self-serve web form.

Staff data entry for phone/email requests.

Accept photos, location, contact info, needs, priority.

Map: Residents/requests, volunteers, open shelters/food kitchens/equipment locations—filterable and searchable.

Pin Drop: Authorized users can drop/edit pins with notes & photos.

Radius Alerts: Notify opted-in residents/volunteers within X miles of a newly posted resource.

Basic Flood Context: Show current or last-known flood extents / flood-prone areas layer.

ARC Notify: One-click compose standardized alert to Red Cross duty email (pre-filled template + CSV/GeoJSON export).

Mobile-friendly: Works on phones in the field.

Nice-to-Have (Phase 2)

Offline-tolerant field capture (queue & sync).

Multi-language form (ES/EN at minimum).

Photo moderation flagging.

Simple routing (nearest volunteer to request).

De-duplication / merging of repeated requests.

Architecture (Free-First with Upgrade Path)
Option A – Free/Open Stack (default)

Frontend: Static site on GitHub Pages (or Cloudflare Pages); MapLibre or Leaflet with OpenStreetMap tiles.

Backend/Data: Supabase (Free tier) with Postgres + PostGIS + Row Level Security.

Auth: Supabase Auth (email OTP / magic links).

Forms: Tally or Google Forms embedded; webhook to Supabase (Edge Function) to create records + geocode.

Geocoding: Nominatim (courteous rate-limit) or Geocodio (cheap key, optional).

Alerts:

Email: Supabase + Resend/SendGrid free tier, or simple mailto fallback.

SMS (optional, paid): Twilio; Phase 2 only.

File Storage: Supabase Storage for photos.

Geofencing: PostGIS ST_DWithin for radius matching on insert/update triggers.

Option B – ArcGIS-Native (if Nonprofit credits available)

ArcGIS Online + Survey123/Instant Apps/Experience Builder for forms & maps.

Hosted Feature Layers for Requests/Resources/Volunteers.

Arcade pop-ups; GeoTriggers/Webhooks + PBF to email/SMS.

Notes: Not “free”; discounted nonprofit pricing. Choose if deep ESRI integration or existing AGO org is required.

Start with Option A. Leave clean adapters so later we can point at ArcGIS Feature Services without rewriting UI.

Data Model (Postgres + PostGIS)

All tables include id UUID PK, created_at, updated_at, created_by, updated_by.

requests

resident_name TEXT

phone TEXT

email TEXT

address TEXT

notes TEXT

need_type TEXT (enum: food, water, muck_out, debris, medical, welfare_check, other)

priority TEXT (low/med/high/urgent)

status TEXT (new, triage, assigned, in_progress, complete, duplicate, unable_to_contact)

geom GEOGRAPHY(Point, 4326)

photos JSONB[] (array of {url, caption})

source TEXT (self, phone, email, import)

assignment JSONB ({volunteer_id, scheduled_at, eta})

volunteers

full_name TEXT

phone TEXT

email TEXT

skills TEXT[] (e.g., chainsaw, muck_out, spanish, cpr)

availability TEXT (now, today, week, weekends)

home_base TEXT

opt_in_alerts BOOLEAN

geom GEOGRAPHY(Point, 4326) (approximate or last check-in)

resources (shelters, kitchens, equipment, supply drops)

resource_type TEXT (shelter, kitchen, equipment, water, food, charging, wifi, other)

name TEXT

hours TEXT

capacity INTEGER

status TEXT (open, full, closed, stand_by)

contact_phone TEXT

geom GEOGRAPHY(Point, 4326)

details JSONB (freeform: shelter rules, pet policy, dietary, etc.)

alerts

alert_type TEXT (resource_opened, resource_closed, safety, update)

title TEXT

message TEXT

radius_km NUMERIC

origin GEOGRAPHY(Point, 4326)

audience TEXT (residents, volunteers, both)

dispatch_channel TEXT (email, sms, both)

dispatched_at TIMESTAMP

attachments

table_ref TEXT (requests/resources/volunteers)

ref_id UUID

url TEXT

caption TEXT

content_type TEXT

size_bytes INT

audit_log

actor UUID

action TEXT

table_ref TEXT

ref_id UUID

diff JSONB

Indexes: GIST on all geom. Btree on status, need_type, resource_type.

User Roles

Public: Submit request form; view public resources map (no PII).

Intake Staff: Create/edit requests; mark status; upload photos.

Field Volunteer: See assigned requests + nearby resources; update status.

Coordinator/Admin: Manage volunteers/resources; send alerts; exports.

Row-Level Security: Public read only to public_resources_view (no PII). Staff/volunteers gated by Supabase Auth + policies.

Core Workflows
1) Request Intake

User submits form (resident or staff on phone).

Edge Function geocodes address → stores point; saves photos.

Status defaults to new, priority auto-heuristics (medical keywords → urgent).

Optional dedupe: fuzzy match on phone/email + 250m radius.

2) Pin Drop & Edit

Auth’d user opens map, “Add pin” → choose type: request/resource → form modal.

Store to respective table; push to map immediately.

3) Radius Alert

When a resource is opened/updated to status=open, admin can “Send alert to X km”.

PostGIS: SELECT email FROM recipients WHERE ST_DWithin(recip.geom, :origin, :meters) where recipients = opted-in volunteers + requesters.

Send email (free) now; SMS optional later.

4) Volunteer Proximity

Map shows your location (with consent); list “nearest 10 requests within 5 km” sorted by priority/status.

“Accept request” → creates assignment on request; coordinator can reassign.

5) Notify Red Cross

Button: “Prepare ARC Email” → opens mailto: with prefilled subject/body + link to CSV and GeoJSON exports of selected features.

Exports served from public, rotating URLs valid 24h.

6) Flood Layers

Base: OSM. Overlay:

Static historic flood-prone polygons (local open data) uploaded as GeoJSON.

Dynamic raster (Phase 2).

Symbology: muted blues; transparency 40%.

Privacy & Safety

Do not show PII on public map.

Phone/email hashed in public views.

Emergency notes (medical, domestic situations) hidden except to Admin + Assignee.

Log every access and edit in audit_log.

Frontend Deliverables

Pages

/ Landing — description + big buttons: “Request Help”, “Find Nearby Aid”, “Volunteer”

/map (public resources only, no PII)

/dashboard (auth)

Tabs: Requests | Volunteers | Resources | Alerts | Exports

Filters: need_type, status, priority, date, miles from point

/submit Request form (embedded Tally/Google)

/login (Supabase auth)

Map UX

Clustered points; clear color ramp per layer (resources vs requests vs volunteers).

Pin popup: compact card, action buttons (Assign, Mark In Progress, Complete).

“Drop Pin” floating button (auth only).

Accessibility/Design

High-contrast, large hit targets, offline icon hints.

Colors: Red Cross–aware palette (muted gray, slate, white; accent red only for critical).

Edge Functions & Triggers (Supabase)

on_form_submit (HTTP): validate → geocode → insert requests.

on_resource_opened (DB trigger): optionally queue alert if flagged.

send_alert (HTTP): accepts {origin, radius_km, audience, message} → PostGIS radius query → dispatch email.

export_features (HTTP): signed URL returning CSV/GeoJSON for selected IDs (expires in 24h).

SQL sketches (Claude should render full scripts):

-- GIST indexes
CREATE INDEX idx_requests_geom ON public.requests USING GIST (geom);
CREATE INDEX idx_resources_geom ON public.resources USING GIST (geom);

-- Nearby recipients (meters)
-- SELECT ... FROM recipients WHERE ST_DWithin(recip.geom, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :meters);

Security & Roles (Supabase Policies)

public_resources_view: anon can SELECT only non-PII fields.

requests: only authenticated staff/volunteers can SELECT; volunteers cannot see PII unless assigned.

volunteers: volunteers can edit their own profile & location; admins can manage all.

resources: read for all auth; write admin only.

alerts: admin only.

Claude should generate RLS policies with tests.

Integrations (simple, low-friction)

Email: Resend/SendGrid free tier; fallback mailto:.

SMS: Twilio (Phase 2).

Geocode: Nominatim (respect rate/UA) with optional paid Geocodio key env var.

File uploads: Supabase Storage (images only; size cap).

ARC Notify: configurable ARC_ALERT_EMAIL env var.

Repo Structure (Claude: scaffold this)
/app
  /web (React + Vite; MapLibre + TanStack Query; Auth)
    /components
    /pages (index, map, dashboard, submit, login)
    /styles
  /edge-functions (Supabase)
    on_form_submit.ts
    send_alert.ts
    export_features.ts
  /db
    schema.sql
    seed.sql
    policies.sql
  /infra
    supabase.toml
    .env.example
README.md
CONTRIBUTING.md

Definition of Done (MVP)

Public site deployed to GitHub Pages/Cloudflare Pages.

Authenticated dashboard live; can create/edit requests & resources; upload photos.

Map shows clustered layers; filters work; pin drop works for auth users.

Form → record in DB with geocoded point.

“Send alert” works for email audience within radius.

Public map shows resources only (no PII).

Export to CSV/GeoJSON works with signed URLs.

RLS policies tested.

Prompts for Claude Code (execute in order)

Scaffold & Infra

Create monorepo as above.

Initialize Supabase, add PostGIS, generate schema.sql, policies.sql, seed.sql.

Provide npm scripts for local dev & deploy.

Frontend

Build /map with MapLibre, three toggleable layers (requests, volunteers, resources); cluster + legends.

Implement /dashboard with tabs and filters.

Implement auth + role-based UI (hide PII unless assigned/admin).

Add “Drop Pin” modal (type: request/resource) and persist.

Functions

Implement on_form_submit (validate/geocode/insert), send_alert (ST_DWithin), export_features (signed).

Write unit tests/mocks for geocoder + PostGIS queries.

Forms

Create Tally (or Google Forms) with fields matching requests. Wire webhook to on_form_submit.

Provide a staff-friendly /submit with field hints & image upload.

ARC Notify

Add “Notify ARC” UI → mailto: prefill + dynamic links to latest CSV/GeoJSON export.

Docs

Write README with deploy/run steps, env vars, and “Operations Guide” (intake → assign → complete).

Acceptance Criteria (MVP scenarios)

Intake staff can add a request from a phone call in under 60 seconds.

Adding a new open shelter at point X allows sending a 3 km email alert to opted-in recipients.

Volunteers can see top 10 nearest high-priority requests and accept one.

Public map shows only resources, with live status.

Coordinator can export selected requests & resources as CSV/GeoJSON and share.

Upgrade Notes (ArcGIS path)

Replace Supabase tables with ArcGIS Feature Services via thin DAL.

Swap MapLibre layers with ArcGIS JS API FeatureLayers.

Replace geofence with GeoTriggers/Feature Filter + webhooks.

Keep UI identical.

Compliance & Data Handling

No public PII.

Consent for location and alerts.

Remove or redact sensitive notes in exports by default.

Log admin actions.

Configuration (.env.example)
SUPABASE_URL=
SUPABASE_ANON_KEY=
RESEND_API_KEY=    # or SENDGRID_API_KEY
GEOCODIO_API_KEY=  # optional
ARC_ALERT_EMAIL= duty.officer@redcross.org
DEFAULT_ALERT_RADIUS_KM=3

Stretch Ideas (take us a step further)

Auto-triage using simple keyword rules (e.g., “medical”, “elderly alone”) → priority bump.

Volunteer skills matching (chainsaw → debris requests).

“Pop-Up” mode for canvassing teams: QR signs at shelters linking to the request form with pre-filled location.

Data handoff: nightly export to ARC formats; ICS for shelter shifts.

Photo diff before/after for reporting.