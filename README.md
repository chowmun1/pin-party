# Pin Party

**Where have you been?** A GeoGuessr-style party game made from your own trip photos.

Upload your holiday photos, mark where each one was taken, and play it with family and friends on one laptop or TV. Everyone takes a turn to drop a pin on a world map. The postcard then flips over to reveal the real spot, who was closest, and the points. The highest total wins.

It's a static website: no server, no accounts, and no sign-up.

> The app's name lives in one place, `APP_NAME` in [`src/config.ts`](src/config.ts). Change that line to rename the app everywhere it appears in the UI and in export files. This README needs updating by hand.

---

## Features

- **Quiz editor**
  - Add photos by drag-and-drop or the file picker. They're shrunk to 1600 px JPEG to save space.
  - If a photo has GPS data, its answer pin is filled in automatically.
  - Set each answer with a draggable pin and a place search.
  - Add an optional hint, shown while guessing, and a place name, revealed with the answer.
  - Reorder and remove photos, with a warning if you try to leave with unsaved changes.
- **Game setup:** 1–12 players or teams, each with a name and a colour, optional photo shuffle, and km or miles.
- **Pass-and-play rounds**
  - Each player guesses in private.
  - A "pass to…" screen between turns stops the next player seeing the last guess.
  - The map resets for every turn.
- **Reveal:** the photo's postcard flips over. The answer pin drops in, each guess draws a line to it, the points count up, and a CLOSEST stamp lands.
- **Final results:** a winner card, a leaderboard (ties share a place), a "Your trip" strip and a round-by-round table.
- **Export and import:** save a quiz as a single `.json` file to share, then open it on any device.
- **Accessibility**
  - Works with keyboard and touch.
  - Large text on TVs.
  - Players are never told apart by colour alone.
  - Respects "reduce motion".

## Run it locally

You need [Node.js](https://nodejs.org) 20.19 or newer (22 recommended).

```bash
npm install      # download the libraries the app uses (into node_modules/)
npm run dev      # start a local server that reloads as you edit; open the URL it prints
```

The app runs at `http://localhost:5173/pin-party/`. Press `Ctrl+C` in the terminal to stop it.

Other commands:

```bash
npm test         # run the unit tests once (scoring, game logic, storage, import/export)
npm run build    # type-check, then build the production site into dist/
npm run preview  # serve the built dist/ folder locally, to check a build before deploying
```

### Map tiles (optional API key)

- **With a key:** the map uses Esri's street map, which has English place names and allows commercial use (including ads).
- **Without a key:** it falls back to the standard OpenStreetMap map, with place names in each country's own language.

To use the Esri map:

1. Create a free [ArcGIS Location Platform](https://location.arcgis.com/) account.
2. Create **developer credentials** with these settings:
   - **Type:** API key
   - **Use:** Public application
   - **Item access:** none
   - **Privilege:** Location services → Basemaps → **Static basemap tiles** only
   - **Referrer URLs:** `http://localhost:5173`, `http://localhost:4173` and `https://<your-github-username>.github.io`
3. Copy `.env.example` to `.env.local` and paste the key after `VITE_ARCGIS_API_KEY=`. Git ignores `.env.local`, so the key won't be committed.
4. Restart `npm run dev`.

The key is visible in the built website (that's normal for map keys). The referrer list is what stops other sites using it. Keys expire after at most a year, so set a reminder to create a new one. Esri's free tier is 2 million tiles a month, and there's no automatic spending cap, so check usage now and then in the ArcGIS dashboard.

## Deploy to GitHub Pages

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push to `main`. It installs the libraries, runs the tests, builds the site and publishes it.

One-time setup on GitHub:

1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. *(Optional, for the Esri map)* **Settings → Secrets and variables → Actions → New repository secret:**
   - Name: `VITE_ARCGIS_API_KEY`
   - Value: your key
3. Push to `main`. You can follow progress in the **Actions** tab. When it finishes, the site is live at:

```
https://<your-github-username>.github.io/pin-party/
```

**Different repository name or a custom domain?** The site's base path is set in one place, `BASE_PATH` in [`vite.config.ts`](vite.config.ts). It must be `/<repo-name>/`, or `/` for a custom domain. The app uses hash URLs (`…/pin-party/#/quiz/…`), so refreshing any page works on GitHub Pages without extra setup.

## How quiz storage works

- **Where quizzes live:** quizzes are stored in your browser's IndexedDB, on the device where you made them. They are not uploaded anywhere.
- **Sharing:** a quiz exists only on that device until you export it. Use ⋯ → **Save as file to share** on the home screen. This downloads one `.json` file with the photos inside it. On another device, choose **Open a quiz file** to add it.
- **Clearing data:** clearing your browser's site data deletes your quizzes, so export anything you want to keep.
- **Games aren't saved:** a game in progress lives only in memory. Refreshing the page mid-game resets that game, but never touches saved quizzes.
- **Swapping the storage:** all storage goes through one interface, `QuizRepository` ([`src/storage/QuizRepository.ts`](src/storage/QuizRepository.ts)). To add a cloud backend, implement that interface and change one line in [`src/storage/index.ts`](src/storage/index.ts).

**Export file format:** JSON with `kind: "quiz-export"`, a `formatVersion` (currently 1) and the app name. Images are embedded as base64. Imports are checked before saving: the file type, the format version, the title, the coordinates and the image types.

## Scoring

Points per round are `round(5000 × e^(−distance_km / 2000))`, where the distance is the great-circle (haversine) distance:

- a perfect guess scores 5,000 points
- 2,000 km away scores 1,839
- 10,000 km away scores 34

The formula lives in [`src/game/scoring.ts`](src/game/scoring.ts), with its tests next to it, so it's easy to tweak.

## Project structure

```
src/
  config.ts            app name, export format version, limits
  types.ts             Quiz / Photo data model
  game/                pure game logic: scoring, state machine, players, formatting (+ tests)
  storage/             QuizRepository interface, IndexedDB implementation, export/import (+ tests)
  editor/              quiz editor pieces and draft validation (+ tests)
  play/                setup, guess, hand-off, reveal and results screens
  pages/               routed pages (home, editor, play, not found)
  map/                 Leaflet map, pins, tile source
  components/          shared UI: stamps, postmarks, dialogs, menus, location picker
  styles.css           all styling; design tokens at the top
PRODUCT.md             who the product is for and its principles
DESIGN.md              the "Wish You Were Here" design system
```

## Roadmap

- **Accounts and cloud storage:** sign in to keep quizzes across devices. This would add a Supabase or Firebase version of `QuizRepository`.
- **Share links:** send a quiz as a link instead of a file.
- **Online multiplayer:** everyone guesses at once on their own phones, with the TV as the shared screen.
- **Host controls:** skip a player, end a game early, team mode.
- **Ads:** before showing ads, add a privacy policy and, for UK/EU visitors, a cookie consent banner.
- **Custom domain:** add it to the Pages settings and the ArcGIS referrer list, and set `BASE_PATH` to `/`.

## Credits

- **Maps:** [Leaflet](https://leafletjs.com), with tiles from [Esri](https://www.esri.com) or [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- **Place search:** [Nominatim](https://nominatim.org), which is OpenStreetMap data.
- **Fonts:** Alfa Slab One, Atkinson Hyperlegible and Patrick Hand, all under the SIL Open Font License, via [Fontsource](https://fontsource.org).
- **Icons:** [Lucide](https://lucide.dev) (ISC).
- **Demo quiz illustrations:** drawn in SVG for this project.
