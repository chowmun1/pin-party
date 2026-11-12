# Product

## Platform

web

## Users

Families and mixed-age groups (kids, parents, grandparents) playing together in one room. Typically one person, the **quiz maker**, has built a quiz from their own trip photos ("where were we?") and hosts the game; everyone else are **players** or teams who take turns placing a pin on a world map. Players may be young children or older adults with no gaming or map experience, so every step must be obvious without explanation.

## Product Purpose

Pin Party turns personal travel photos into a GeoGuessr-style party game. A quiz maker uploads photos, marks where each was taken (pre-filled from photo GPS when available), saves the quiz, and replays it any time. In play, each player/team guesses each photo's location on a world map; the reveal shows the true spot, every guess, distances and points; final results crown a winner.

Success: a group sits down, starts the game within a minute, laughs at the reveals, and asks to play again or make their own quiz.

## Positioning

Your own photos, your own family's trips, as a shared-screen party game, free, no accounts, no install. Unlike GeoGuessr (Street View, solo/online, subscription), the content is personal and the play is together in one room.

## Operating Context

- Played on one device shared by the room: most often a laptop connected to a TV or projector, or a laptop on a table that the group gathers around and passes along. Phones are a secondary case.
- Pass-and-play: players take turns on the same device; a "pass to next player" screen sits between turns.
- On a TV/projector the whole room can see the screen, so the reveal moment is a shared event.
- The quiz maker builds quizzes beforehand on a laptop (upload, place answer pins, captions).

## Capabilities and Constraints

- Static single-page app on GitHub Pages (`/pin-party/` base path, hash routing). No server, no login, no accounts.
- Quizzes live in the browser's IndexedDB on the device that made them; sharing between devices is by exporting/importing a `.json` file with images embedded.
- Game state is in memory only; refreshing mid-game resets the game but never touches saved quizzes.
- 1–12 players or teams; optional photo shuffle; distance in km or miles.
- Scoring: `round(5000 * exp(-distanceKm / 2000))` per round, haversine distance.
- Map: Leaflet + OpenStreetMap tiles; place search via Nominatim (rate-limited, submit-only).
- Photos are downscaled on upload (≤1600px, JPEG 0.8); EXIF GPS pre-fills the answer pin, and is stripped from the stored image.
- Planned (roadmap, not built): accounts, cloud storage, online multiplayer.
- Undecided: per-photo "answer name" (place label shown at the reveal) is approved for the next UI pass.

## Brand Commitments

- Name: "Pin Party", stored in one constant (`APP_NAME` in `src/config.ts`) so it can be renamed in one line.
- A pin icon is the logo/favicon.
- Tagline: "Where have you been?" (the home screen heading).
- Voice: friendly, warm, inclusive; all-ages, never childish, never snarky.

## Evidence on Hand

- One demo quiz (3 hand-drawn SVG landmark illustrations, `src/seed/demoQuiz.ts`). No real user photos, testimonials, usage numbers or press exist; do not invent any.

## Product Principles

1. **Anyone can play in seconds.** A 7-year-old and a 77-year-old should understand every screen without being told.
2. **The reveal is the show.** The shared moment of seeing where it really was, and who was closest, is the emotional peak of every round.
3. **Readable across a room.** Large type, high contrast and clear turn indicators that work on a TV across a living room as well as on a laptop up close.
4. **Personal over generic.** The content is the family's own photos; the product frames those memories rather than competing with them.
5. **Never lose a quiz.** Saved quizzes are sacred; games are disposable.

## Accessibility & Inclusion

- WCAG 2.2 AA contrast; players are never distinguished by colour alone (name labels always accompany colour).
- Keyboard and touch operable throughout; touch targets at least 44×44px.
- Respect `prefers-reduced-motion`.
- Mixed ages: plain language, no jargon, no time pressure by default.
