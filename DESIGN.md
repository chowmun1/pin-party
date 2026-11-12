---
name: Pin Party
description: Your own trip photos as picture postcards; guess where each was sent from, then turn it over.
colors:
  airmail-blue: "#1d4e9e"
  airmail-blue-deep: "#163d7d"
  on-ground: "#ffffff"
  on-ground-muted: "#d6e2f7"
  postcard-stock: "#fbfbf7"
  paper-shade: "#eef0ea"
  ink: "#1a1a2e"
  ink-muted: "#4a5068"
  rule: "#c9ccd6"
  rule-strong: "#8a8fa3"
  placeholder: "#6b7084"
  map-water: "#b3d1e8"
  pillar-box-red: "#d7263d"
  pillar-box-red-deep: "#b81d32"
  red-tint: "#fde8eb"
  red-ink: "#7a1020"
  sunshine: "#ffc93c"
  sun-tint: "#fff4d1"
  stamp-green: "#1f7a3f"
  green-tint: "#e4f3e8"
  green-ink: "#0f4524"
typography:
  display:
    fontFamily: "'Alfa Slab One', 'Rockwell', Georgia, serif"
    fontSize: "clamp(2.25rem, 5.4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.005em"
  headline:
    fontFamily: "'Alfa Slab One', 'Rockwell', Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.005em"
  title:
    fontFamily: "'Alfa Slab One', 'Rockwell', Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.15
  title-sm:
    fontFamily: "'Alfa Slab One', 'Rockwell', Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.1
  caption:
    fontFamily: "'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  stamp-label:
    fontFamily: "'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  handwriting:
    fontFamily: "'Patrick Hand', 'Comic Neue', 'Segoe Print', cursive"
    fontSize: "1.2em"
    fontWeight: 400
    lineHeight: 1.3
  handwriting-lead:
    fontFamily: "'Patrick Hand', 'Comic Neue', 'Segoe Print', cursive"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.3
  handwriting-name:
    fontFamily: "'Patrick Hand', 'Comic Neue', 'Segoe Print', cursive"
    fontSize: "clamp(2.25rem, 4.6vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.05
rounded:
  card: "4px"
  inner: "6px"
  control: "8px"
  round: "999px"
spacing:
  tight: "0.6rem"
  base: "1rem"
  group: "1.25rem"
  section: "1.5rem"
  spread: "2rem"
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  sheet: "clamp(1.1rem, 2.4vw, 2rem)"
components:
  button-primary:
    backgroundColor: "{colors.pillar-box-red}"
    textColor: "{colors.on-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.15rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.pillar-box-red-deep}"
  button-secondary:
    backgroundColor: "{colors.postcard-stock}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.15rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.paper-shade}"
  button-on-ground:
    textColor: "{colors.on-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.15rem"
    height: "2.75rem"
  button-danger:
    backgroundColor: "{colors.pillar-box-red-deep}"
    textColor: "{colors.on-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.15rem"
    height: "2.75rem"
  button-lg:
    padding: "0.6rem 1.5rem"
    height: "3.25rem"
  button-xl:
    padding: "0.7rem 2rem"
    height: "3.75rem"
  button-lock-in-disabled:
    textColor: "{colors.on-ground-muted}"
  input:
    backgroundColor: "{colors.on-ground}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.8rem"
    height: "2.75rem"
  address-line-input:
    textColor: "{colors.ink}"
    typography: "{typography.handwriting}"
    rounded: "{rounded.card}"
    padding: "0.35rem 0.25rem"
    height: "3rem"
  postcard:
    backgroundColor: "{colors.postcard-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.7rem 0.7rem 1rem"
  sheet:
    backgroundColor: "{colors.postcard-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.sheet}"
  stamp:
    backgroundColor: "{colors.pillar-box-red}"
    textColor: "{colors.on-ground}"
    typography: "{typography.stamp-label}"
    padding: "0.3rem 0.5rem"
    size: "3.4rem"
  stamp-answer:
    backgroundColor: "{colors.sunshine}"
    textColor: "{colors.ink}"
  dialog:
    backgroundColor: "{colors.postcard-stock}"
    textColor: "{colors.ink}"
    padding: "1.5rem 1.5rem 1.25rem"
    width: "min(32rem, calc(100vw - 2rem))"
  menu:
    backgroundColor: "{colors.on-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.35rem"
    width: "15rem"
  menu-item-hover:
    backgroundColor: "{colors.paper-shade}"
    rounded: "{rounded.inner}"
  segmented-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ground}"
    rounded: "{rounded.inner}"
  notice-error:
    backgroundColor: "{colors.red-tint}"
    textColor: "{colors.red-ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  notice-success:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.green-ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  leader-row-winner:
    backgroundColor: "{colors.sun-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.6rem 1.25rem 0.6rem 0.75rem"
  trip-card:
    backgroundColor: "{colors.postcard-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.45rem 0.45rem 0.6rem"
  map-frame:
    backgroundColor: "{colors.map-water}"
    rounded: "{rounded.card}"
---

# Design System: Pin Party

## Overview

**Creative North Star: "Wish You Were Here"**

Every trip photo is a picture postcard and the whole app is airmail stationery laid on a desk of airmail blue. The blue ground owns the page; everything you read or touch sits on white postcard stock with ink on it. The postal kit supplies the vocabulary: a red, white and blue chevron stripe along the header and the edges of special paper, perforated stamps that carry numbers (round counts, ranks, player numbers), circular postmarks with wavy cancel lines, ruled address lines, and an inked rubber stamp for the result that matters. The play itself follows the postcard: the setup screen is a postcard back with the player names written on the address lines, each turn is addressed "To:" a player in handwriting, and the reveal turns the round's postcard over to show its handwritten back.

Density is low and type is large because the room reads the screen from a sofa. The root font size scales with the viewport (16px to 26px), and every size is in rem, so a TV gets proportionally bigger type, pins and targets. Paper sits slightly askew at rest and straightens when you reach for it; nothing glows, nothing is glass, nothing is dark-stage. The family's photos are the content and the stationery frames them.

**Key Characteristics:**
- Airmail-blue ground with postcard-stock surfaces; text on the blue is white or pale blue only.
- Three typefaces with three jobs: slab for print, Atkinson Hyperlegible for controls, Patrick Hand for anything a person wrote.
- Postal devices (airmail stripe, perforated stamps, postmarks, address lines, rubber stamps) carry information, not decoration.
- Soft blue-black paper shadows, 4px card corners, slight resting tilts.
- One orchestrated reveal sequence; everything else moves only as paper would.

## Colors

A postal palette: airmail blue for the ground, pillar-box red for action and postal ink, sunshine yellow for what is found or chosen, stamp green for points and success, all on white postcard stock.

### Primary
- **Pillar-Box Red** (#d7263d): the fill of the primary button and the red chevrons of the airmail stripe; also a stamp colour on home postcards and the caret colour. Hover and pressed state deepen to **Deep Pillar-Box Red** (#b81d32), which is also the ink of the "Closest" and "WINNER" rubber stamps, the reveal postmark, destructive buttons, error text and invalid field borders.
- **Red Tint** (#fde8eb): error notices, the photo-missing row, the drag-over drop zone and the hover of destructive menu items and icon buttons.
- **Red Ink** (#7a1020): text on Red Tint (error notices), where Deep Pillar-Box Red would read too light.

### Secondary
- **Sunshine** (#ffc93c): the answer pin (with a drawn ink star), the round stamp, the winner's rank stamp, the selected photo outline in the editor, the "make a new quiz" plus disc, the best-cell star, the outer halo of the focus ring, the closest pin's halo and the ring around its name on the reveal map, and text selection.
- **Sun Tint** (#fff4d1): the winner's leaderboard row, best cell in the breakdown table, focused address line and search result hover.

### Tertiary
- **Stamp Green** (#1f7a3f): points awarded on the reveal (+25), the winner's handwritten "best" line on results, "ready" status, the on state of toggles, and a stamp colour.
- **Green Tint** (#e4f3e8): success notices and inline confirmations.
- **Green Ink** (#0f4524): text on Green Tint (success notices and inline confirmations).

### Neutral
- **Airmail Blue** (#1d4e9e): the page ground (including behind the sticky editor head and the sticky guess action bar on wide screens), and also the blue in the airmail stripe, postmark ink on handoff and not-found, the handwritten place name on the turned postcard, and the first player colour.
- **Deep Airmail Blue** (#163d7d): the header band and the sticky guess action bar on phones.
- **White** (#ffffff): text and outlined-button strokes on the ground; perforated stamp stock, map frame, menu and input fields.
- **Pale Airmail** (#d6e2f7): secondary text on the ground (leads, counts, helper copy).
- **Postcard Stock** (#fbfbf7): every content surface: postcards, sheets, dialogs, secondary buttons, the segmented control.
- **Paper Shade** (#eef0ea): photo wells before load, quiet hover on paper, table row rules.
- **Ink** (#1a1a2e): all text on paper, the secondary button stroke, the active segment, inner ring of the focus ring.
- **Muted Ink** (#4a5068): secondary text on paper, handwritten descriptions and greetings, table headers.
- **Rule Grey** (#c9ccd6): address lines, the ruled divide down a postcard back, the drop zone's dashed outline, the search results border, toggle off track.
- **Strong Rule** (#8a8fa3): text input outlines, at 3:1 against the white field.
- **Placeholder Grey** (#6b7084): placeholder text in inputs and on the setup address lines.
- **Map Water** (#b3d1e8): the map frame's background while tiles load, close to the tile sea so loading never flashes grey.

### Player inks
Twelve player colours live in `src/game/players.ts`, each at least 5.2:1 with white label text: blue #1d4e9e, green #1f7a3f, orange #b84a00, purple #6a2c91, teal #00707a, magenta #b0186b, brown #7a4a1e, slate #3d4a5c, olive #5c6b00, gold #8a6100, indigo #4338ca, black #111111.

### Named Rules
**The Postcard Stock Rule.** The blue ground holds only headings, short leads and outlined buttons. Anything with more than a sentence of content, any form and any table sits on postcard stock in ink.

**The Pillar Box Rule.** Pillar-box red is the only filled button colour, and each card or screen has one filled red action. Outside buttons, red appears only as postal ink: the airmail stripe, stamps, postmarks, rubber stamps and errors.

**The Sunshine Rule.** Yellow marks what has been found or chosen: the answer, the winner, the current selection and the focus halo. It is never a player colour.

**The Name Beside Colour Rule.** Player colours never appear without the player's name next to them: pins carry name labels, dots sit in a chip with the name. Players never get red or yellow.

## Typography

**Display Font:** Alfa Slab One (with Rockwell, Georgia, serif)
**Body Font:** Atkinson Hyperlegible 400/700 (with system-ui, Segoe UI, sans-serif)
**Handwriting Font:** Patrick Hand (with Comic Neue, Segoe Print, cursive)

All three are self-hosted through @fontsource.

**Character:** A heavy large-letter slab like the lettering on a vintage "Greetings from" postcard, paired with a face designed for low-vision legibility for everything you operate, and a friendly marker hand for what people wrote.

### Hierarchy
- **Display** (400, clamp(2.25rem, 5.4vw, 4rem), 1.08): the home heading (the tagline "Where have you been?") and the winner headline.
- **Headline** (400, clamp(2.25rem, 4vw, 3rem), 1.08): the reveal's place name; screen headings default to 2.25rem.
- **Title** (400, 1.75rem, 1.15): section titles on the ground, dialog titles, leaderboard totals, reveal points.
- **Title Small** (400, 1.375rem, 1.15): postcard titles, sheet titles, the drop zone line, large labels, the round stamp number.
- **Body** (400, 1rem, 1.5): running text; leads step up to 1.125rem at a 60ch measure.
- **Label** (700, 1rem): buttons, form labels, chips, menu items, notices.
- **Caption** (700, 0.875rem): helper text (400 weight), status markers, table headers, segmented control.
- **Stamp Label** (700, 0.7rem, 0.08em, uppercase): the denomination under a stamp number ("ROUNDS"); the rubber stamp heading uses the same treatment at 0.875rem and 0.12em.
- **Handwriting** (400, 1.2em, 1.3): quiz descriptions, captions and greetings; 1.375rem as a lead; the player name on the guess strip scales to clamp(2.25rem, 4.6vw, 4rem) and on the handoff postcard to clamp(3rem, 6.5vw, 6rem); setup address lines are 1.75rem; the winner's "best" line is 1.375rem in Stamp Green; trip card place names are 1.125rem.

### Named Rules
**The Three Hands Rule.** Slab for what is printed on the card (titles, numbers, stamps, totals), Atkinson for everything you operate or read as interface, Patrick Hand for what a person wrote (names, descriptions, captions, greetings, the postcard back). Buttons, form labels and table data are never handwritten.

**The Across the Room Rule.** The root font size is clamp(16px, 0.6vw + 12px, 26px) and every size is in rem, so type, pins and targets grow on a TV. Never set type in px.

## Layout

The page is a single column inside an 1800px container with fluid gutters (clamp(1rem, 3vw, 2.5rem)) and 4rem of bottom room. Screens are built from two-up grids that collapse to one column: the editor (list 19 to 25rem plus detail, at 820px), guess (photo 1.05fr beside map 1fr, at 900px), reveal (a top row with the slab place heading left and the extra-large "Next photo" button right; below it the turned postcard and scores, 0.9fr and at least 20rem, beside the map 1.4fr; at 980px one column in the order heading, postcard, map, scores, then Next stretched full width last), setup and handoff (a postcard back split by a ruled 2px line at 50%, at 760px and 680px), and results (winner photo beside text, at 760px; below the leaderboard a "Your trip" strip of small postcards in auto-fill columns of at least 10rem).

Home is a postcard grid: auto-fill columns of at least 18rem with generous gaps (2.25rem rows, 1.75rem columns). From 1100px the newest postcard becomes landscape and spans two columns. A dashed blank postcard slot ends the grid.

Rhythm: 0.6rem inside rows and lists, 1rem to 1.25rem between related blocks, 1.5rem between grid regions, 2rem to 3rem across a postcard's divide. Postcard and sheet padding is clamp(1.1rem, 2.4vw, 2rem). Lone cards (not found) cap at 40rem, setup at 64rem, handoff at 56rem, the leaderboard at 60rem.

Maps size from the viewport: the guess map is clamp(16rem, 100dvh minus 19rem, 44rem) so the address strip, map and actions fit one screen from a 768px laptop to a TV (58vh on phones); the reveal map is clamp(18rem, 100dvh minus 15rem, 52rem) (55vh on phones).

Sticky bars keep the next step in reach. The editor page head (title and save actions) sticks to the top on the blue ground. The guess actions stick to the bottom at every width on the blue ground; on phones they become a full-bleed bar on Deep Airmail Blue, stacked with the primary action on top. On phones the results actions also stack full width. Tilted cards never create sideways scroll (the app shell clips horizontal overflow).

## Elevation & Depth

Depth is paper on a desk: soft shadows tinted blue-black (rgb 8 22 60), offset downward with a wide negative-spread blur, in three steps. Nothing is flat-tonal and nothing uses hard offset shadows or glows. Stamps and pins, whose shapes are irregular, take a drop-shadow filter instead of a box shadow.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 2px 4px rgb(8 22 60 / 0.25), 0 14px 28px -10px rgb(8 22 60 / 0.55)`): postcards, sheets, the map frame, the drop zone, the guess address strip.
- **Lift** (`box-shadow: 0 4px 8px rgb(8 22 60 / 0.25), 0 22px 40px -12px rgb(8 22 60 / 0.6)`): a hovered or focused postcard, the winner card, dialogs and menus.
- **Control** (`box-shadow: 0 1px 2px rgb(8 22 60 / 0.25), 0 3px 8px -2px rgb(8 22 60 / 0.3)`): filled buttons, notices, list rows, the segmented control, the toggle knob.
- **Stamp** (`filter: drop-shadow(0 1px 1.5px rgb(8 22 60 / 0.45)) drop-shadow(0 0 0.5px rgb(8 22 60 / 0.5))`): on the stamp's wrapper, because the perforation mask would clip it on the stamp itself.
- **Pin** (`filter: drop-shadow(0 3px 2px rgb(0 0 0 / 0.35))`): map pins; pin name labels take a small `0 1px 4px rgb(8 22 60 / 0.45)`.
- **Action bar** (`box-shadow: 0 -6px 16px rgb(8 22 60 / 0.35)`): the phone guess bar, cast upward over the page it floats above.

### Named Rules
**The Press Flattens Rule.** A pressed button moves down 1px and loses its shadow; outlined and ghost buttons carry no shadow at all.

**The Lift Is a Reach Rule.** Paper rises from Card to Lift only when it is being reached for (hover or focus within) or is the result that matters (winner card, open dialog).

## Shapes

Paper has barely rounded corners (4px) and controls are softer (8px); items inside a control (segments, menu items, search results) use 6px. Toggles and player dots are fully round. Stamps have true perforated edges cut by a radial-gradient mask with a 4px perforation radius on white stock. Rubber stamps are double-ruled rectangles (3px outer stroke plus an inset ring) with an SVG noise mask so the impression looks pressed. Photos sit in a white mat (0.5 to 0.7rem) and keep a 3:2 frame on postcards.

Resting tilt is part of the form: home postcards cycle -0.8deg, 0.6deg and -0.3deg and straighten on hover or focus; the handoff card and turned postcard sit at -0.6deg, the winner card at -0.4deg; trip cards alternate -0.8deg and 0.7deg; stamps tilt up to 4deg; postmarks -6 to -8deg; rubber stamps -7 to -8deg.

The airmail stripe is a 135deg repeating gradient of red, white, blue, white in 14px bands. It runs as an 8px band under the header, a 6px edge along the top of the guess address strip, and a 10px border image around dialogs.

## Components

### Buttons
Chunky, tactile and printed: bold labels, a solid target of at least 44px.
- **Shape:** gently rounded (8px), 2px border, min height 2.75rem; large 3.25rem, extra large 3.75rem. Large sizes wrap long player names rather than overflow.
- **Primary:** Pillar-Box Red fill, white label, control shadow, 0.5rem by 1.15rem padding.
- **Hover / Focus:** hover rises 1px and deepens to Deep Pillar-Box Red; pressed drops 1px and flattens. Focus is a two-ring halo, 3px ink inside 6px sunshine.
- **Secondary:** postcard stock with a 2px ink stroke and no shadow; hover shades to Paper Shade.
- **On ground:** transparent with a white 2px stroke and white label, for actions on the blue (open a quiz file, back, change players); hover adds a 12% white wash.
- **Ghost and icon:** transparent, square 2.75rem icon buttons for dismiss, more and row actions; destructive icons use Deep Pillar-Box Red with a red-tint hover.
- **Danger:** Deep Pillar-Box Red fill, used in place of primary in a destructive confirm dialog.
- **Disabled:** 45% opacity, no shadow, no pointer. On the blue ground the disabled "Lock in" primary instead goes outlined at full opacity: transparent, a 45% white stroke and Pale Airmail label, so it reads as waiting rather than broken.

### Segmented Control
- **Style:** a postcard-stock capsule (8px, 3px padding, control shadow) holding 6px-cornered segments in 0.875rem bold.
- **State:** the active segment is solid ink with white text (units: Kilometres / Miles).
- **Placement:** the distance unit is chosen once, on the setup postcard back ("Show distances in"), below a bold Muted Ink scoring line; the reveal and results carry no unit toggle.

### Postcards
The home unit. A postcard-stock card with a 0.7rem white mat around a 3:2 photo, a perforated stamp overlapping the top-right edge showing the round count, a slab title clamped to two lines, a handwritten description clamped to two lines, and an action row (red Play stretching, Edit secondary, a more menu). Card shadow at rest, lift and straighten on hover or focus within (220ms). The blank slot is a 3px dashed white outline on the ground with a sunshine plus disc, a slab line and a handwritten line.

### Sheets / Postcard Backs
- **Corner Style:** 4px.
- **Background:** postcard stock with ink.
- **Shadow Strategy:** Card.
- **Internal Padding:** clamp(1.1rem, 2.4vw, 2rem).
- **Postcard back variant:** split into message (left) and address (right) by a 2px Rule Grey line inset 2rem top and bottom; the divide disappears when the card stacks.

### Inputs / Fields
- **Style:** white field, 2px Strong Rule border, 8px corners, 2.75rem minimum; placeholders in Placeholder Grey.
- **Focus:** border goes to ink plus the two-ring focus halo; hover goes to Muted Ink.
- **Error:** Deep Pillar-Box Red border with bold red error text below.
- **Address line:** borderless handwriting input (1.75rem Patrick Hand) on a 2px ruled baseline, each with a player dot; focus fills with Sun Tint. Used for writing player names on the setup postcard back.
- **Toggle:** a 3.4 by 2rem round track, Rule Grey off and Stamp Green on, with a white shadowed knob.

### Navigation
The header is a Deep Airmail Blue band with the pin logo and the slab wordmark (1.75rem) on the left and an 8px airmail stripe along its bottom edge; the brand link is at least 2.75rem tall. There is no other persistent navigation; screens move forward through their primary action, and secondary routes (back, change players, home) are on-ground outlined buttons.

### Stamps
A perforated postage stamp carrying a number (round counts, ranks, player numbers) and an optional stamp label. Coloured stock (red, green, blue or ink on home; sunshine for round and answer stamps with ink text; player colour on handoff), three sizes (3, 3.4, 4.6rem), a slight tilt, and the stamp drop shadow on its wrapper.

### Postmarks
An SVG circular postmark (double ring with text running around it and a short word in the middle) followed by four wavy cancel lines, drawn in currentColor at 85% opacity and tilted. Blue on handoff and not found ("Return to sender"), Deep Pillar-Box Red on the turned postcard ("HERE").

### Rubber Stamps
Inked results pressed onto paper. The "Closest" stamp sits in the corner of the turned postcard: Deep Pillar-Box Red, double-ruled, rotated -7deg, a noise mask for broken ink, with an uppercase heading, the player's name in slab capitals and the distance. The "WINNER" stamp sits on the winner postcard in slab capitals with a 4px stroke at -8deg. Both land with a scale-down entrance (from 1.6x to 2x).

### Map and Pins
The map is Esri's Streets static basemap tiles with English place names when an ArcGIS key is configured (src/map/tiles.ts; OpenStreetMap tiles otherwise), framed like a photo: a 6px white border, 4px corners, card shadow, and Map Water behind the tiles. Player pins are teardrops in the player's ink with a white stroke and white dot; the answer pin is Sunshine with an ink stroke and a drawn ink star. Every pin carries a bold name label in a pill of its own colour with a 2px white border; labels alternate above and below so neighbours do not collide. On the reveal map the name labels are permanent map tooltips in a pane above every marker, so no pin covers a name; the closest pin gets a Sunshine halo disc behind it (4.2rem, 55% sun with a 4px 35% ring, no blur) and its name pill a 3px Sunshine ring. Pins scale with the root font size up to 1.6x, and every pin's hit box is at least 44px wide.

### Dialog and Menu
The confirm dialog is a native dialog on postcard stock, framed by a 10px airmail-stripe border, with the Lift shadow and a 65% deep-blue backdrop; slab title, muted body, actions right-aligned. The more menu is a white 15rem panel (8px, Lift shadow) of 2.75rem bold items; destructive items are red with a red-tint hover.

### Reveal sequence
The signature interaction, staged so the room reads one thing at a time. First the place: the round's postcard flips on Y (900ms, from 150ms) from photo to its handwritten back ("Greetings from", the place in Airmail Blue handwriting, the caption, a sunshine round stamp, a red "HERE" postmark, address lines) while the slab place heading fades up (600ms after 450ms). Then the pins: the answer pin drops (520ms after 650ms) and each guess's route draws in (800ms from 950ms, staggered 150ms). At about 2.2s the "Closest" rubber stamp lands (420ms) and the closest pin's halo grows in (500ms). At about 2.5s the score table rises in (420ms), "Next photo" follows 180ms behind, and points count up; both stay hidden until then. All on the ease-out curve cubic-bezier(0.16, 1, 0.3, 1). Under reduced motion every element shows its final state at once.

### Trip Strip
The results screen's "Your trip" row: one small postcard per round (postcard stock, a 0.45rem mat around a 3:2 photo, the place name in 1.125rem handwriting clamped to two lines), Control shadow, alternating tilt. Above it, the winner card shows the winner's best round photo with a handwritten Stamp Green line naming the place and distance.

## Do's and Don'ts

### Do:
- **Do** put every content surface on Postcard Stock (#fbfbf7) with Ink (#1a1a2e) text, and keep the Airmail Blue (#1d4e9e) ground for headings, leads and outlined buttons.
- **Do** give each card or screen exactly one Pillar-Box Red (#d7263d) filled action.
- **Do** use postal devices to carry information: stamps for counts and ranks, postmarks for round and status, address lines for names, rubber stamps for results.
- **Do** set player names, descriptions, captions and greetings in Patrick Hand, and every control in Atkinson Hyperlegible.
- **Do** keep targets at least 2.75rem and size everything in rem so the root clamp (16px to 26px) scales it for a TV.
- **Do** show every player colour with the player's name beside it.
- **Do** use the three paper shadows (Card, Lift, Control) and the ease-out curve cubic-bezier(0.16, 1, 0.3, 1) for paper movement.
- **Do** give every animation a final state that reduced motion shows instantly.

### Don't:
- **Don't** fill buttons in any colour but Pillar-Box Red (Deep Pillar-Box Red for destructive confirms); secondary actions are stroked.
- **Don't** give a player red or yellow, or show a player colour without a name.
- **Don't** use Sunshine for anything except the answer, the winner, selection and focus.
- **Don't** set buttons, form labels or table data in the handwriting face.
- **Don't** use hard offset shadows, glows or glass; depth is soft paper shadow only.
- **Don't** let tilted paper create sideways scrolling.
