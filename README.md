# Fleet Management — Abra Fleet (working copy)

The same Abra Fleet system as
[abra-travels-app](https://github.com/mynampatiasha/abra-travels-app) —
Flutter fleet management app (`abra_fleet/`) + Node.js/Express/MongoDB
backend (`abra_fleet_backend/`) — kept here as an actively-worked-on copy
with a large number of one-off maintenance scripts, database backups, bulk
import CSVs, and dated fix-summary documents accumulated during development
and production troubleshooting.

## Tech stack

Same as `abra-travels-app`:
- **Mobile app**: Flutter
- **Backend**: Node.js, Express, MongoDB, Redis, Socket.io, Firebase Admin,
  push notifications (OneSignal/Web Push), scheduled jobs

## Structure

```
abra_fleet/             # Flutter app
abra_fleet_backend/     # Express API
database_backups_*/     # point-in-time MongoDB backups
*.md                    # dated implementation/fix-summary notes kept as a
                          # running log of production issues and their fixes
*.js (top-level)         # one-off maintenance/data-fix scripts (roster
                          # assignment, distance recalculation, backup
                          # utilities, driver/account fixes, etc.) — run
                          # individually with `node <script>.js`, not part
                          # of the app itself
*.csv                   # bulk-import templates and data (vehicles, rosters)
```

## Running locally

```bash
cd abra_fleet_backend
npm install
npm run dev
```
Requires a `.env` with MongoDB/Redis connection strings, Firebase service
account credentials, and push-notification provider keys.

```bash
cd abra_fleet
flutter pub get
flutter run
```

The many top-level `.md` files are historical fix/implementation notes, not
end-user documentation — useful for tracing why a particular change was
made, not for onboarding onto the project.
