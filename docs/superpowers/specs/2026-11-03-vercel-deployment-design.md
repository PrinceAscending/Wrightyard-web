# Wrightyard production deployment design

**Date:** 2026-11-03
**Scope:** Website and repository only. The Discord gateway bot remains a separate
persistent-host deployment.

## Intent

Ship the Wrightyard website on Vercel's free `vercel.app` subdomain, with the
GitHub repository as the source of truth and every push to `main` producing a
production deployment. The result should be a repository another developer can
clone, understand, verify, and redeploy without private context.

## Goals

- Publish the site at `https://wrightyard.vercel.app` (claim that name if
  available; otherwise use the closest Vercel-assigned name and document it).
- Populate `PrinceAscending/Wrightyard-web` with a clean initial history.
- Add repeatable CI for the site and bot: install, typecheck, build.
- Keep all credentials out of Git. Provide `.env.example` coverage only.
- Configure production environment variables in Vercel, including MongoDB,
  Discord OAuth, session signing, and the bot heartbeat secret.
- Register the production Discord OAuth callback and verify sign-in.
- Verify the production site, APIs, auth guard, brief intake, dispatch archive,
  status page, and owner console.
- Document that the gateway bot is not hosted on Vercel and must run on a
  persistent host.

## Non-goals

- Hosting the discord.js gateway bot on Vercel.
- Buying a custom domain.
- Changing the visual design or adding product features.
- Rewriting the bot for Discord's HTTP interactions endpoint.

## Anti-goals

- Committing `.env.local`, `bot/.env`, tokens, MongoDB URIs, or session secrets.
- Deploying a build that only works on localhost.
- Using a preview URL as the production OAuth origin.
- Presenting the bot as online when it is not running.

## Constraints

- Vercel functions cannot hold the gateway websocket, rich presence, or timers.
- The existing production database already contains briefs, tickets,
  announcements, and state; deployment must point at the same database.
- `NEXT_PUBLIC_SITE_URL` is read into client-visible metadata and must be the
  final production HTTPS origin.
- Discord OAuth redirect URIs must match exactly.
- Vercel, GitHub, and Discord actions require the account owner's authenticated
  browser session or CLI login.
- No secret values may be printed in terminal output, logs, or committed files.

## Approaches considered

1. **GitHub-connected Vercel project — chosen.** Push the repository, import it
   into Vercel, connect `main`, configure encrypted environment variables, and
   deploy. Trades a small amount of setup for automatic deployments, preview
   builds, and a durable production workflow.
2. **CLI-only deploy — rejected.** Faster for one upload, but leaves no
   automatic production pipeline and makes future releases manual.
3. **Prepare and hand off — rejected.** Keeps credentials with the user, but does
   not satisfy the request to finish the hosting work.

## Implementation outline

1. **Repository preparation**
   - Add Node version pinning (`engines`, `.nvmrc`).
   - Add `.vercelignore` so local builds, dependencies, and bot runtime state are
     not uploaded.
   - Add GitHub Actions CI for site and bot install/typecheck/build.
   - Update `README.md` with the production URL, deployment flow, CI, and the
     bot's separate host.
2. **Preflight**
   - Run site typecheck and build, bot typecheck and build.
   - Run a secret scan over staged files.
   - Confirm ignored files: `.env.local`, `bot/.env`, build output, dependencies.
3. **Git history and push**
   - Create meaningful commits rather than one opaque dump where practical.
   - Push `main` to `origin`.
   - Set repository description and topics if GitHub CLI/API access is available.
4. **Vercel project**
   - Install/link the Vercel CLI, authenticate, and connect the GitHub repository.
   - Name the project `wrightyard` and confirm the production domain.
   - Add all required environment variables as encrypted production values.
   - Deploy `main` and confirm the build succeeds.
5. **OAuth and production verification**
   - Add `https://wrightyard.vercel.app/api/auth/callback` to the Discord
     application.
   - Set `NEXT_PUBLIC_SITE_URL` to the production origin and redeploy if needed.
   - Verify `/`, `/status`, `/dispatch`, `/login`, `/dashboard`, `/admin`, brief
     intake, and the auth guards in a real browser at desktop and mobile widths.
6. **Handoff**
   - Record the production URL, deployment controls, and remaining bot-host
     steps in `README.md`.
   - Report any credential rotation still required.

## Security decision

The Discord bot token, OAuth client secret, and MongoDB password were previously
exposed in chat. The recommended path is to rotate the Discord credentials and
the MongoDB password before the first production deploy, update both local env
files, restart the local bot, and then configure Vercel with the new values.

If rotation is not possible in this session, deployment may proceed only with an
explicit note that the existing credentials remain exposed and must be rotated
before the site is shared publicly.

## Verification and success criteria

- `https://wrightyard.vercel.app` serves the site over HTTPS.
- A push to `main` triggers a successful Vercel production deployment.
- GitHub Actions passes for site and bot.
- Discord sign-in returns to `/dashboard` on the production origin.
- `/status` reports MongoDB as the durable backend.
- A test brief is rejected or filed without exposing private contact details.
- The owner console loads only for the configured owner ID.
- No secret appears in `git ls-files` or the pushed repository.
- The README clearly separates website hosting (Vercel) from bot hosting
  (persistent process).
