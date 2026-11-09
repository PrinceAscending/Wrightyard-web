# Changelog

Notable changes to the Wrightyard website. Versions follow the bot's release
line so the site and bot can be deployed together.

## [1.1.0] - 2026-11-09

### Added

- Discord OAuth gate, member dashboard, owner bench, job-brief intake, ticket
  history, dispatch archive, and the public live report.
- Signed bot heartbeat ingestion with presence, maintenance, and command-sync
  overrides.
- Groq-powered `/ask` and `/brief` commands in the bot, with the matching site
  copy and deployment documentation.

### Security

- Owner-only APIs with same-origin checks, session guards, rate limits, and
  audit marks.
- HMAC-SHA256 heartbeat verification over the exact raw body, hashed-IP rate
  limit keys, and strict security headers (`X-Frame-Options: DENY`, HSTS,
  `nosniff`, restrictive permissions policy).
- Discord REST rate-limit retries are now capped at two attempts with a bounded
  wait instead of retrying recursively without limit.

### Changed

- Deployment documentation now reflects the live Pterodactyl bot and the
  Node 20.19+ runtime floor.
