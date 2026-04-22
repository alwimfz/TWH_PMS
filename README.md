# Primus PMS — Housekeeping Suite

A property management system module for housekeeping and maintenance operations.

## Modules

| Module | Description |
|---|---|
| **Master Rooms** | Source of truth — add, edit, delete room structure (number, floor, type) |
| **Room Board** | Live operational status board — change status per room |
| **Assignments** | Auto-assign dirty rooms to on-shift housekeepers |
| **Maintenance** | Raise and track maintenance requests — auto-syncs room status |
| **Shift Roster** | Manage staff, roles, and shift attendance |
| **Analytics** | Live shift metrics and breakdowns |
| **Audit Log** | Immutable timestamped record of all actions |

## Room Status Flow

```
Available → Occupied → Dirty → Available
               ↓
          Maintenance  (auto-set when maintenance request raised)
               ↓
          Available    (auto-set when request resolved)
               ↓
          Blocked      (manual — out of service)
```

## Auto-Assignment Logic

Only rooms with status **Dirty** are eligible. Rooms are distributed round-robin to on-shift housekeepers — the housekeeper with the fewest current assignments receives the next room. Manual override available per room.

## Maintenance Auto-Sync

- **Create request** → room status immediately set to `Maintenance`
- **Resolve request** → room status set to `Available` (if no other open requests remain for that room)

---

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Deploy to Vercel via GitHub

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pms-housekeeping.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** → select `pms-housekeeping`
3. Framework Preset: **Vite** (auto-detected)
4. Build Command: `npm run build` (auto-filled)
5. Output Directory: `dist` (auto-filled)
6. Click **Deploy**

Vercel will auto-deploy on every push to `main`.

## Tech Stack

- **React 18** — UI
- **Vite 5** — build tool
- **No backend** — all state is in-memory (browser session)
- **Google Fonts** — Outfit + JetBrains Mono (loaded via CSS import)
