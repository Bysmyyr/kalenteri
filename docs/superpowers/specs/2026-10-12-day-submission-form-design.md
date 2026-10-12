# Day submission form – design

Date: 2026-10-12

## Goal

Let people submit (new) or edit (existing) a calendar day through a form that
previews the card exactly as it will look on the site, and produces output that
can be pasted into the code without any cleanup. There is no backend: the site is
static (GitHub Pages) and the form delivers its result by email via Web3Forms
(free tier, 250 submissions/month).

## Constraints and decisions

- Static hosting only. No server, no database, no repo write access from the form.
- Web3Forms free tier is text-only (file attachments are Pro). The photo is
  therefore resized in the browser and sent as a base64 text field. Whether
  Web3Forms limits the size of a single field is **unverified**; this is tested
  with a real submission before the rest is built. Fallback if it fails: upload to
  an image host and send a URL (requires a small change to `getImagePath`).
- UI language: Finnish, like the site.
- The existing site is preserved as a standalone copy in `2025/` (not part of
  this work; do not modify it).
- The `?v=` cache-busting parameter in `index.html` must be bumped whenever
  `js/app.js` changes (see `.claude/project-rules.md`).

## Modes and links

| Mode | URL | Day | Secret |
|------|-----|-----|--------|
| New | `form.html` | Free-text field (e.g. "12 or 15, not 20th") | none |
| Edit | `form.html?day=12&key=SECRET&edit=1` | From URL, read-only | `key` sent as hidden field |

- No verification happens in the browser; the secret is only submitted so it is
  visible in the email. The author checks it manually and reviews everything
  before pasting.
- Edit mode with a missing `day` or `key`, or a `day` not present in
  `locations`, shows a message to ask for a link instead of the form.
- New mode: a hidden honeypot field named `botcheck` is included (documented
  Web3Forms feature, confirmed by the author). Restricting the access key to the site's domain in the
  Web3Forms dashboard is the second protection. The access key is public in
  `form.js` by design.

## Form fields

- Day (new mode only): free text, required.
- Description: textarea, required.
- Preview description (shown before the day arrives): textarea, optional, with a
  short explanation of what it is.
- Photo: file input; resized client-side (about 800 px longest side, JPEG
  quality about 0.7, target roughly 100 KB). Optional in both modes. In edit
  mode, no photo keeps the existing image. In new mode, no photo leaves `image`
  out of the snippet (the site then shows the default image).
- Location: Leaflet map; click or drag a marker. This is the only way to set
  `lat`/`lng`; there are no coordinate inputs. In edit mode the marker starts at
  the existing location. Send is disabled until a location is set.
- Contact fields (name, email, phone): all mandatory, in both modes.
- Pasted HTML is reduced to `<b>` tags only (the text ends up in `innerHTML` on
  the real site).

## Preview

- A card rendered by the same function and CSS as the real site, updated live.
- A toggle switches between the "before the day" view (default image plus preview
  description) and the full view.
- In new mode there is no real day number; the badge shows "?".

## Shared code (refactor of existing files)

New plain-script modules sharing globals (no bundler needed on served pages):

- `js/locations.js`: the existing `locations` array moved unchanged out of
  `app.js`, exposed on `window`.
- `js/card.js`: one `renderCard(location, options)` used by `app.js` and by
  the form preview. `app.js` currently builds card markup in two places
  (`renderLocationsList` and `moveCardToTop`) with slightly different layouts
  (the highlighted card wraps content in `.card-content` and places the badge
  differently). `renderCard` takes a `variant` option and must reproduce both
  layouts exactly. Existing behaviour of the site must not change.
- `index.html` loads `locations.js`, `card.js`, then `app.js`; version parameter
  bumped.
- `webpack.config.prod.js` copy list gains the new files and `form.html`.

## Email contents

Fields sent to Web3Forms:

- `mode` (new/edit), `day` (typed text in new mode, number in edit mode),
  `key` (edit only), contact fields.
- `snippet`: a complete JS object, valid JS, using JSON-escaped strings, with
  `day`, `image` (only if a photo was chosen, or kept from existing data in
  edit mode), `description`, `previewDescription` (only if set), `lat`, `lng`. In edit mode it replaces the existing object. In new mode the first line
  is `day: 0, // requested: "<text>"`, with the text flattened to one line so it
  cannot break the code; the author edits the number before pasting.
  If a photo was chosen in new mode, the image line is `image: "0.jpg", // rename to <day>.jpg`
  (the day is not known yet), and the author changes it to the real day.
- `image`: base64 data URL of the resized photo (only if a photo was chosen).

## Saving the photo

`pbpaste | node scripts/save-image.js <day>` reads the base64 data URL from
stdin and writes `img/<day>.jpg`. Images are always named `<day>.jpg`. If an
edit replaces a differently named file (e.g. `3.png`), the old file stays until
manually deleted. The snippet's `image` value is `"<day>.jpg"`.

## Errors

If sending fails, the form keeps all entered data, shows an error, and offers a
"copy snippet" fallback.

## Testing

- Pure functions (snippet builder, HTML stripper, comment flattener) get
  `node --test` unit tests; no new dependencies.
- Manual checks: new and edit flows, map picker, preview toggle, photo resize,
  a real Web3Forms submission (including the base64 field size check), and a
  before/after comparison of `index.html` to confirm the card refactor changed
  nothing visible.

## Out of scope

- Any change to `2025/`.
- Server-side verification of the secret.
- Automatic writing to the repo.
