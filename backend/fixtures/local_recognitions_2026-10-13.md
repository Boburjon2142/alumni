# Local recognition snapshot

Exported on 2026-10-13: 26 approved, active assignments for 12 existing alumni;
8 active recognition titles. Source: the existing local database, not inferred
from portraits, professions or PNG filenames. No account credentials, user IDs,
private contact details, profiles or media uploads are included.

Run `python manage.py import_local_recognitions` to validate without writing.
After backing up the server database, run with `--apply` to import atomically.
Profiles must already exist with exactly matching slugs. Missing profiles,
inactive server titles or conflicting assignments abort the whole import.
Existing title metadata and assignments are preserved. Repeated imports skip
matching awards. No schema migration or frontend rebuild is required for this
snapshot. Cache is invalidated after apply.

The eight local title slugs are not the same as the nine PNG title slugs.
Only `ilm-fan-fidoyisi` has supplied matching artwork. All assignments appear
in the public API and existing recognition UI; the PNG row displays only
titles that have matching original artwork. No substitute images are assigned.
