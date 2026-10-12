# Day Submission Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static `form.html` where people submit (new) or edit (existing) a calendar day with live site-identical preview and a map picker, delivering a paste-ready JS snippet plus a resized photo by email via Web3Forms.

**Architecture:** Plain `<script>` modules sharing browser globals, written UMD-style so the pure ones (`card.js`, `form-lib.js`) also load in Node for `node --test`. The `locations` array moves to `js/locations.js`; one `renderCard` in `js/card.js` replaces the two duplicated card templates in `js/app.js` and also drives the form preview. `form.js` is the only DOM/network code.

**Tech Stack:** Vanilla JS (ES2022), Leaflet 1.9.4 (unpkg, as in `index.html`), Web3Forms JSON API, Node 24 `node --test` / `node:assert`, existing eslint + webpack pre-commit hooks.

**Spec:** `docs/superpowers/specs/2026-10-12-day-submission-form-design.md`

## Global Constraints

- Static hosting only; no backend, no new npm dependencies.
- UI text in Finnish, like the site.
- Do not modify anything under `2025/` (archived copy of the old site).
- Whenever `js/app.js` changes, bump the `?v=` number on the `js/app.js` script tag in `index.html` by 1 (`.claude/project-rules.md`). Current value: `2334478`.
- Existing site behaviour must not change visibly (card markup and CSS classes stay identical).
- Web3Forms free tier is text-only: the photo travels as a base64 data URL in a text field (about 800 px longest side, JPEG quality about 0.7, roughly 100 KB).
- Description HTML is reduced to `<b>`/`</b>` only; everything else is escaped.
- New mode: `day` is a free-text field, no secret, honeypot field named `botcheck`. Edit mode: `form.html?day=N&key=SECRET&edit=1`, `key` sent as a field and not checked in the browser.
- Name, email and phone are mandatory in both modes. Photo is optional in both modes.
- Location is set only by clicking/dragging a map marker; no coordinate inputs; Send disabled until a location exists.
- Snippet is a complete JS object ending in `},` using `JSON.stringify` strings; lat/lng rounded to 6 decimals.
- Photo is saved as `img/<day>.jpg`.
- Pre-commit hooks run eslint (`**/*.js`) and `npm run build`; every commit must pass them.

## Review Focus

Inputs the spec implies but a happy-path test would miss, most likely first. Each has a test in the task named in brackets.

1. Description containing `"`, `\`, newlines, `</script>`, U+2028/U+2029: the snippet must still be valid JS that evaluates to the same text. [Task 3]
2. Free-text day field containing newlines, `}, evil: 1, {`, or U+2028 (a JS line terminator that ends a `//` comment): must not break out of the snippet comment. [Task 3]
3. Pasted HTML (`<script>`, `<img onerror=...>`, `<b onclick=...>`, unbalanced or uppercase `<B>`): neutralised, only plain `<b>`/`</b>` survive, and always balanced. [Task 3]
4. Photo absent in new mode (omit `image`), absent in edit mode (keep existing image, or omit when none), present in new mode (placeholder `0.jpg` with a rename comment). [Task 3]
5. Clipboard text given to `save-image.js`: base64 hard-wrapped by an email client, raw base64 without the `data:` prefix, non-JPEG data, empty input, and a hostile day argument (`../x`, `0`, `25`, `1.5`). Must refuse rather than write a wrong file or escape `img/`. [Task 4]
6. Edit link with unknown day, missing key, or no `day`: shows the "link not valid" message, not an empty form. [Task 5, manual]

---

### Task 1: Extract `locations` into `js/locations.js`

**Files:**
- Create: `js/locations.js`
- Create: `test/locations.test.js`
- Modify: `js/app.js:5-13,202` (remove array and its comment block, read from `window.LOCATIONS`)
- Modify: `index.html` (script tags, version bump)
- Modify: `package.json` (`test` script)

**Interfaces:**
- Produces: `window.LOCATIONS` (array of `{ day:number, description?:string, previewDescription?:string, image?:string, lat?:number, lng?:number }`), identical to the current array.

- [ ] **Step 1: Make `npm test` run `node --test`**

In `package.json` replace the `test` script line with:

```json
    "test": "node --test",
```

- [ ] **Step 2: Write the failing test**

Create `test/locations.test.js`:

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

globalThis.window = globalThis.window || {};
require('../js/locations.js');

describe('locations data', () => {
  it('exposes 24 locations with unique days 1..24', () => {
    const days = window.LOCATIONS.map(l => l.day);
    assert.deepEqual(days, Array.from({ length: 24 }, (_, i) => i + 1));
  });
});
```

- [ ] **Step 3: Run it, expect failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/locations.js'`.

- [ ] **Step 4: Create `js/locations.js` by moving the array text mechanically**

Do not retype the data. Confirm the array bounds first, then build the file with shell tools:

```bash
grep -n "let locations = \[" js/app.js    # expect 13
grep -n "^  \];" js/app.js                # expect 202
{
  printf '// Locations configuration (edit these to customize your advent calendar)\n'
  printf '// All locations in Littoinen, Finland area\n'
  printf '// Optional preview fields (shown before the date arrives):\n'
  printf '//   - previewDescription: Show this description before the date arrives\n'
  printf '//   - previewImage: Show this image before the date arrives (optional, uses same image if not set)\n'
  printf 'window.LOCATIONS = [\n'
  sed -n '14,201p' js/app.js | sed 's/^  //'
  printf '];\n'
} > js/locations.js
```

(If the grep line numbers differ, adjust `14,201` to the lines strictly between `let locations = [` and `];`.)

- [ ] **Step 5: Verify the moved data equals the archived original exactly**

`2025/js/app.js` is an untouched copy, so use it as the baseline:

```bash
node -e '
const fs = require("fs"), vm = require("vm");
const src = fs.readFileSync("2025/js/app.js", "utf8");
const start = src.indexOf("let locations = [");
const end = src.indexOf("\n  ];", start) + 4;
const old = vm.runInNewContext(src.slice(start, end).replace("let locations =", "(") + ")");
const win = {}; vm.runInNewContext(fs.readFileSync("js/locations.js", "utf8"), { window: win });
const a = JSON.stringify(old), b = JSON.stringify(win.LOCATIONS);
console.log(a === b ? "IDENTICAL" : "DIFFERENT");
process.exit(a === b ? 0 : 1);
'
```
Expected: prints `IDENTICAL`.

- [ ] **Step 6: Run the test, expect pass**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 7: Point `app.js` at the shared data**

In `js/app.js`, keep lines 1-6 (header comment, IIFE opener, `'use strict'`, the `DEFAULT_IMAGE` comment and constant). Remove lines 8-202 (the "Locations configuration" comment block and the whole `let locations = [ ... ];`) and put these two lines in their place, so the top of the file reads:

```js
// Advent Calendar Map Application
(function() {
  'use strict';

  // Default image to use when no image is specified
  const DEFAULT_IMAGE = "img/default.png";

  // Locations come from js/locations.js
  let locations = window.LOCATIONS;
```

`DEFAULT_IMAGE` is still used by `app.js` until Task 2.

- [ ] **Step 8: Load the new script in `index.html` and bump the version**

Replace the script line in `index.html`:

```html
  <script src="js/locations.js?v=1"></script>
  <script src="js/app.js?v=2334479"></script>
```

- [ ] **Step 9: Verify in browser**

Run: `python3 -m http.server 8000` (leave running), open `http://localhost:8000/?preview_all=on` and `http://localhost:8000/2025/?preview_all=on` in two tabs.
Expected: identical map markers and identical list of 24 cards; no console errors.

- [ ] **Step 10: Commit**

```bash
git add js/locations.js js/app.js index.html package.json test/locations.test.js
git commit -m "Move locations data into js/locations.js

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
Expected: eslint and webpack hooks pass.

---

### Task 2: Shared card renderer (`js/card.js`) and `app.js` refactor

**Files:**
- Create: `js/card.js`
- Create: `test/card.test.js`
- Modify: `js/app.js` (`getImagePath`, `DEFAULT_IMAGE`, `moveCardToTop`, `renderLocationsList`)
- Modify: `index.html` (script tag, version bump)

**Interfaces:**
- Consumes: `window.LOCATIONS` (Task 1) in tests only.
- Produces: `window.CalendarCard = { DEFAULT_IMAGE, getImagePath(filename?:string):string, renderCard(location, options?):string }`
  - `location`: `{ day:number|string, description?:string, previewDescription?:string, image?:string }` (`day` may be a non-number such as `'?'`).
  - `options`: `{ variant?:'list'|'highlighted' (default 'list'), showPreview?:boolean, imageUrl?:string }`. `imageUrl` overrides the photo URL when `showPreview` is false (used for data URLs in the form preview).
  - Returns the card's outer HTML string. Also exports (Node only) via `module.exports` with the same object.

- [ ] **Step 1: Write the failing tests**

Create `test/card.test.js`:

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

globalThis.window = globalThis.window || {};
require('../js/locations.js');
const { renderCard, getImagePath, DEFAULT_IMAGE } = require('../js/card.js');

const normalize = html => html.replace(/>\s+</g, '><').trim();

// Reference copies of the two templates as they existed in js/app.js before the refactor.
function legacyImagePath(f) {
  if (!f) return 'img/default.png';
  if (f.startsWith('img/') || f.startsWith('/')) return f;
  return `img/${f}`;
}
function legacyParts(location, showPreview) {
  const desc = showPreview && location.previewDescription ? location.previewDescription : (location.description || 'Tule ja ylläty!');
  return {
    html: desc.replace(/\n/g, '<br>'),
    img: showPreview ? 'img/default.png' : legacyImagePath(location.image)
  };
}
function legacyList(location, showPreview) {
  const { html, img } = legacyParts(location, showPreview);
  return `<div class="location-card" data-day="${location.day}"><img src="${img}" alt="Luukku ${location.day}" class="card-image"><div class="day-badge">${location.day}</div><div class="date">${location.day}. joulukuuta 2025</div><div class="description">${html}</div></div>`;
}
function legacyHighlighted(location, showPreview) {
  const { html, img } = legacyParts(location, showPreview);
  return `<div class="location-card highlighted-card" data-day="${location.day}"><img src="${img}" alt="Luukku ${location.day}" class="card-image"><div class="card-content"><div class="day-badge">${location.day}</div><div class="date">${location.day}. joulukuuta 2025</div><div class="description">${html}</div></div></div>`;
}

describe('renderCard matches the legacy markup for every location', () => {
  for (const location of window.LOCATIONS) {
    for (const showPreview of [false, true]) {
      it(`day ${location.day}, preview=${showPreview}`, () => {
        assert.equal(normalize(renderCard(location, { variant: 'list', showPreview })), normalize(legacyList(location, showPreview)));
        assert.equal(normalize(renderCard(location, { variant: 'highlighted', showPreview })), normalize(legacyHighlighted(location, showPreview)));
      });
    }
  }
});

describe('renderCard extras', () => {
  it('defaults to the list variant', () => {
    const loc = { day: 3, description: 'Hei', image: '3.png' };
    assert.equal(renderCard(loc), renderCard(loc, { variant: 'list' }));
  });

  it('uses the default image and fallback text when missing', () => {
    const html = normalize(renderCard({ day: 5 }));
    assert.ok(html.includes('src="img/default.png"'));
    assert.ok(html.includes('Tule ja ylläty!'));
  });

  it('imageUrl overrides the photo but not the preview default image', () => {
    const loc = { day: 5, description: 'a', previewDescription: 'b', image: '5.png' };
    assert.ok(renderCard(loc, { imageUrl: 'data:image/jpeg;base64,AAAA' }).includes('src="data:image/jpeg;base64,AAAA"'));
    assert.ok(renderCard(loc, { imageUrl: 'data:image/jpeg;base64,AAAA', showPreview: true }).includes('src="img/default.png"'));
  });

  it('renders a non-numeric day with a year-only date line', () => {
    assert.equal(
      normalize(renderCard({ day: '?', description: 'Hei' })),
      '<div class="location-card" data-day="?"><img src="img/default.png" alt="Luukku ?" class="card-image"><div class="day-badge">?</div><div class="date">joulukuuta 2025</div><div class="description">Hei</div></div>'
    );
  });

  it('getImagePath passes through img/ and absolute paths', () => {
    assert.equal(getImagePath('img/x.jpg'), 'img/x.jpg');
    assert.equal(getImagePath('/x.jpg'), '/x.jpg');
    assert.equal(getImagePath('x.jpg'), 'img/x.jpg');
    assert.equal(getImagePath(undefined), DEFAULT_IMAGE);
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/card.js'`.

- [ ] **Step 3: Implement `js/card.js`**

```js
// Shared card markup for the calendar list and the submission form preview.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.CalendarCard = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Default image to use when no image is specified
  const DEFAULT_IMAGE = 'img/default.png';
  const YEAR = 2025;

  // Helper function to get full image path
  function getImagePath(imageFilename) {
    if (!imageFilename) return DEFAULT_IMAGE;
    // If already has img/ prefix or is a full path, return as is
    if (imageFilename.startsWith('img/') || imageFilename.startsWith('/')) {
      return imageFilename;
    }
    // Otherwise, prepend img/
    return `img/${imageFilename}`;
  }

  // options.variant: 'list' (default) or 'highlighted' (the card moved to the top)
  // options.showPreview: show previewDescription and the default image
  // options.imageUrl: explicit photo URL (e.g. a data URL) used when not previewing
  function renderCard(location, options) {
    const opts = options || {};
    const showPreview = Boolean(opts.showPreview);
    const description = showPreview && location.previewDescription
      ? location.previewDescription
      : (location.description || 'Tule ja ylläty!');
    // Convert \n to <br> for HTML display
    const descriptionHtml = description.replace(/\n/g, '<br>');
    const imageUrl = showPreview ? DEFAULT_IMAGE : (opts.imageUrl || getImagePath(location.image));
    const day = location.day;
    const dateText = typeof day === 'number' ? `${day}. joulukuuta ${YEAR}` : `joulukuuta ${YEAR}`;

    const image = `<img src="${imageUrl}" alt="Luukku ${day}" class="card-image">`;
    const badge = `<div class="day-badge">${day}</div>`;
    const date = `<div class="date">${dateText}</div>`;
    const desc = `<div class="description">${descriptionHtml}</div>`;

    if (opts.variant === 'highlighted') {
      return `<div class="location-card highlighted-card" data-day="${day}">
        ${image}
        <div class="card-content">
          ${badge}
          ${date}
          ${desc}
        </div>
      </div>`;
    }
    return `<div class="location-card" data-day="${day}">
      ${image}
      ${badge}
      ${date}
      ${desc}
    </div>`;
  }

  return { DEFAULT_IMAGE, getImagePath, renderCard };
});
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test`
Expected: PASS (all 48 legacy-equivalence cases plus the extras).

- [ ] **Step 5: Refactor `js/app.js` to use it**

(a) Replace the top of the file (through the `let locations` line) with:

```js
// Advent Calendar Map Application
(function() {
  'use strict';

  const { renderCard } = window.CalendarCard;

  // Locations come from js/locations.js
  let locations = window.LOCATIONS;
```

(b) Delete the `getImagePath` function (the `// Helper function to get full image path` comment and the function body).

(c) In `moveCardToTop`, replace everything from `// Determine if we should show preview content` down to (not including) `// Insert at the top` with:

```js
    // Build the card from the shared renderer
    const template = document.createElement('template');
    template.innerHTML = renderCard(location, {
      variant: 'highlighted',
      showPreview: Boolean(shouldShowPreview(location))
    }).trim();
    const highlightedCard = template.content.firstElementChild;

    // Add click handler to the highlighted card
    highlightedCard.addEventListener('click', () => {
      setActiveLocation(location.day);
    });

```

(d) In `renderLocationsList`, replace the whole `listContainer.innerHTML = sortedLocations.map(location => { ... }).join('');` statement with:

```js
    listContainer.innerHTML = sortedLocations.map(location =>
      renderCard(location, {
        variant: 'list',
        showPreview: Boolean(shouldShowPreview(location))
      })
    ).join('');
```

Leave the click-handler block after it untouched.

- [ ] **Step 6: Load `card.js` and bump the version in `index.html`**

```html
  <script src="js/locations.js?v=1"></script>
  <script src="js/card.js?v=1"></script>
  <script src="js/app.js?v=2334480"></script>
```

- [ ] **Step 7: Verify in browser against the archive**

With the server from Task 1 running, compare `http://localhost:8000/?preview_all=on` with `http://localhost:8000/2025/?preview_all=on`, then without `preview_all` but with `?dev_mode=on`. Click a card and a marker in both.
Expected: cards, images, highlighted card at the top, badge positions and map behaviour look identical; no console errors. Also open `http://localhost:8000/?dev_mode=on#day-7` and confirm the highlighted card and its click handler work.

- [ ] **Step 8: Commit**

```bash
git add js/card.js js/app.js index.html test/card.test.js
git commit -m "Share card rendering between list, highlight and form preview

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Snippet and sanitising logic (`js/form-lib.js`)

**Files:**
- Create: `js/form-lib.js`
- Create: `test/form-lib.test.js`
- Modify: `docs/superpowers/specs/2026-10-12-day-submission-form-design.md` (new-mode image placeholder)

**Interfaces:**
- Produces: `window.FormLib = { sanitizeDescription, flattenComment, roundCoord, buildSnippet }` (also `module.exports`):
  - `sanitizeDescription(text:string):string`: `\r\n`/`\r` to `\n`, trim, escape every `<` and `>` except balanced `<b>`/`</b>` (case-insensitive, no attributes); stray `</b>` dropped, unclosed `<b>` closed at the end.
  - `flattenComment(text:string):string`: collapses all whitespace and line terminators (including U+2028/U+2029) to single spaces and trims.
  - `roundCoord(n:number):number`: `Number(n.toFixed(6))`.
  - `buildSnippet(data):string` with `data = { mode:'new'|'edit', day:number|null, dayText:string, image:string|null, description:string, previewDescription:string, lat:number, lng:number }`. Returns the object literal text ending in `},`.

- [ ] **Step 1: Write the failing tests**

Create `test/form-lib.test.js`:

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const { sanitizeDescription, flattenComment, roundCoord, buildSnippet } = require('../js/form-lib.js');

// Evaluate a snippet as JS the way pasting it into the locations array would.
function evalSnippet(snippet) {
  return vm.runInNewContext('(' + snippet.replace(/,\s*$/, '') + ')');
}

describe('sanitizeDescription', () => {
  it('keeps plain b tags', () => {
    assert.equal(sanitizeDescription('Klo <b>17</b> alkaen'), 'Klo <b>17</b> alkaen');
  });
  it('normalises case and escapes everything else', () => {
    assert.equal(sanitizeDescription('<B>a</B>'), '<b>a</b>');
    assert.equal(sanitizeDescription('<script>x</script>'), '&lt;script&gt;x&lt;/script&gt;');
    assert.equal(sanitizeDescription('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
    assert.equal(sanitizeDescription('<b onclick="x">a</b>'), '&lt;b onclick="x"&gt;a');
  });
  it('balances b tags', () => {
    assert.equal(sanitizeDescription('a</b>b'), 'ab');
    assert.equal(sanitizeDescription('<b>a'), '<b>a</b>');
    assert.equal(sanitizeDescription('<b><b>a'), '<b><b>a</b></b>');
  });
  it('normalises line endings and trims', () => {
    assert.equal(sanitizeDescription('  a\r\nb\rc \n'), 'a\nb\nc');
  });
});

describe('flattenComment', () => {
  it('collapses whitespace and every JS line terminator', () => {
    assert.equal(flattenComment(' 12. tai\n15.\r\n(ei 20.)  '), '12. tai 15. (ei 20.)');
  });
});

describe('roundCoord', () => {
  it('rounds to 6 decimals', () => {
    assert.equal(roundCoord(60.45084722008606), 60.450847);
    assert.equal(roundCoord(22.402141327176924), 22.402141);
    assert.equal(roundCoord(60.45), 60.45);
  });
});

describe('buildSnippet', () => {
  const base = { dayText: '', previewDescription: '', lat: 60.45, lng: 22.4 };

  it('formats an edit snippet exactly', () => {
    const snippet = buildSnippet({
      ...base,
      mode: 'edit',
      day: 12,
      image: '12.jpg',
      description: 'Hei "maailma"\nToinen',
      previewDescription: 'Klo <b>17</b>',
      lat: 60.45084722008606,
      lng: 22.402141327176924
    });
    assert.equal(snippet, [
      '{',
      '  day: 12,',
      '  image: "12.jpg",',
      String.raw`  description: "Hei \"maailma\"\nToinen",`,
      '  previewDescription: "Klo <b>17</b>",',
      '  lat: 60.450847,',
      '  lng: 22.402141',
      '},'
    ].join('\n'));
  });

  it('formats a new snippet with the requested day as a comment and a rename hint', () => {
    const snippet = buildSnippet({
      ...base,
      mode: 'new',
      day: null,
      dayText: '12. tai 15.\n(ei 20.)',
      image: '0.jpg',
      description: 'Hei'
    });
    assert.equal(snippet, [
      '{',
      '  day: 0, // requested: "12. tai 15. (ei 20.)"',
      '  image: "0.jpg", // rename to <day>.jpg',
      '  description: "Hei",',
      '  lat: 60.45,',
      '  lng: 22.4',
      '},'
    ].join('\n'));
  });

  it('omits image when none is given and previewDescription when empty', () => {
    const obj = evalSnippet(buildSnippet({ ...base, mode: 'edit', day: 3, image: null, description: 'a' }));
    assert.equal(Object.keys(obj).join(','), 'day,description,lat,lng');
  });

  it('keeps the existing image name in edit mode without a new photo', () => {
    const obj = evalSnippet(buildSnippet({ ...base, mode: 'edit', day: 3, image: '3.png', description: 'a' }));
    assert.equal(obj.image, '3.png');
  });

  it('stays valid JS for hostile description text', () => {
    const description = 'a "q" \\ back\nline </script>   sep   end';
    const obj = evalSnippet(buildSnippet({ ...base, mode: 'edit', day: 3, image: null, description }));
    assert.equal(obj.description, sanitizeDescription(description));
  });

  it('cannot be broken out of via the free-text day', () => {
    for (const dayText of ['12\n}, evil: 1, {', 'x y: 1', 'x y: 1', '"; evil: 1 //']) {
      const obj = evalSnippet(buildSnippet({ ...base, mode: 'new', day: null, dayText, image: null, description: 'a' }));
      assert.equal(Object.keys(obj).join(','), 'day,description,lat,lng', JSON.stringify(dayText));
    }
  });

  it('sanitises pasted HTML inside the snippet', () => {
    const obj = evalSnippet(buildSnippet({ ...base, mode: 'edit', day: 3, image: null, description: '<img src=x onerror=1><b>a' }));
    assert.equal(obj.description, '&lt;img src=x onerror=1&gt;<b>a</b>');
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/form-lib.js'`.

- [ ] **Step 3: Implement `js/form-lib.js`**

```js
// Pure helpers for the day submission form (also loaded by node --test).
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.FormLib = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Keep only balanced <b>...</b>; escape every other < and >.
  function sanitizeDescription(text) {
    let open = 0;
    const normalized = String(text).replace(/\r\n?/g, '\n').trim();
    const out = normalized.replace(/<\/?b>|[<>]/gi, token => {
      const lower = token.toLowerCase();
      if (lower === '<b>') {
        open++;
        return '<b>';
      }
      if (lower === '</b>') {
        if (open === 0) return '';
        open--;
        return '</b>';
      }
      return token === '<' ? '&lt;' : '&gt;';
    });
    return out + '</b>'.repeat(open);
  }

  // One line, safe to place after // (U+2028/U+2029 also end a JS comment).
  function flattenComment(text) {
    return String(text).replace(/[\r\n  ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function roundCoord(n) {
    return Number(Number(n).toFixed(6));
  }

  // Builds the object literal the author pastes into js/locations.js.
  function buildSnippet(data) {
    const entries = [];
    if (data.mode === 'new') {
      entries.push({ text: 'day: 0', comment: `requested: "${flattenComment(data.dayText)}"` });
    } else {
      entries.push({ text: `day: ${data.day}` });
    }
    if (data.image) {
      entries.push({
        text: `image: ${JSON.stringify(data.image)}`,
        comment: data.mode === 'new' ? 'rename to <day>.jpg' : undefined
      });
    }
    entries.push({ text: `description: ${JSON.stringify(sanitizeDescription(data.description))}` });
    const preview = sanitizeDescription(data.previewDescription || '');
    if (preview) {
      entries.push({ text: `previewDescription: ${JSON.stringify(preview)}` });
    }
    entries.push({ text: `lat: ${roundCoord(data.lat)}` });
    entries.push({ text: `lng: ${roundCoord(data.lng)}` });

    const lines = entries.map((entry, i) => {
      const comma = i < entries.length - 1 ? ',' : '';
      return `  ${entry.text}${comma}${entry.comment ? ` // ${entry.comment}` : ''}`;
    });
    return `{\n${lines.join('\n')}\n},`;
  }

  return { sanitizeDescription, flattenComment, roundCoord, buildSnippet };
});
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Record the new-mode image placeholder in the spec**

In `docs/superpowers/specs/2026-10-12-day-submission-form-design.md`, under "Email contents", after the sentence ending "the author edits the number before pasting." add:

```
  If a photo was chosen in new mode, the image line is `image: "0.jpg", // rename to <day>.jpg`
  (the day is not known yet), and the author changes it to the real day.
```

- [ ] **Step 6: Commit**

```bash
git add js/form-lib.js test/form-lib.test.js docs/superpowers/specs/2026-10-12-day-submission-form-design.md
git commit -m "Add snippet builder and description sanitiser for the form

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `scripts/save-image.js`

**Files:**
- Create: `scripts/save-image.js`
- Create: `test/save-image.test.js`
- Modify: `eslint.config.js` (add `Buffer` global)
- Modify: `docs/superpowers/specs/2026-10-12-day-submission-form-design.md` (clipboard command)

**Interfaces:**
- Produces: `parseImagePayload(text:string):Buffer` (throws `Error` with a readable message), `parseDay(arg:string):number` (integer 1..24, else throws). CLI: `<command that prints clipboard> | node scripts/save-image.js <day>` writes `img/<day>.jpg`.

- [ ] **Step 1: Write the failing tests**

Create `test/save-image.test.js`:

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseImagePayload, parseDay } = require('../scripts/save-image.js');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8]);
const b64 = jpeg.toString('base64');

describe('parseImagePayload', () => {
  it('accepts a jpeg data URL', () => {
    assert.deepEqual(parseImagePayload(`data:image/jpeg;base64,${b64}`), jpeg);
  });
  it('accepts raw base64', () => {
    assert.deepEqual(parseImagePayload(b64), jpeg);
  });
  it('tolerates hard-wrapped base64 and surrounding whitespace', () => {
    const wrapped = `\n  data:image/jpeg;base64,${b64.slice(0, 6)}\r\n${b64.slice(6)}  \n`;
    assert.deepEqual(parseImagePayload(wrapped), jpeg);
  });
  it('rejects non-image data URLs', () => {
    assert.throws(() => parseImagePayload(`data:text/html;base64,${b64}`), /image\/jpeg/);
  });
  it('rejects data that is not a JPEG', () => {
    assert.throws(() => parseImagePayload(Buffer.from('hello world').toString('base64')), /JPEG/);
  });
  it('rejects empty input', () => {
    assert.throws(() => parseImagePayload('  \n'), /empty/i);
  });
});

describe('parseDay', () => {
  it('accepts 1..24', () => {
    assert.equal(parseDay('1'), 1);
    assert.equal(parseDay('24'), 24);
  });
  for (const bad of ['0', '25', '1.5', 'abc', '', '../1', '1/../2', '-3', undefined]) {
    it(`rejects ${JSON.stringify(bad)}`, () => {
      assert.throws(() => parseDay(bad), /day/i);
    });
  }
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test`
Expected: FAIL with `Cannot find module '../scripts/save-image.js'`.

- [ ] **Step 3: Implement `scripts/save-image.js`**

```js
// Usage: <command that prints the clipboard> | node scripts/save-image.js <day>
// Reads the base64 photo from a form submission email and writes img/<day>.jpg.
const fs = require('fs');
const path = require('path');

function parseDay(arg) {
  if (!/^\d+$/.test(arg || '')) {
    throw new Error('day must be a whole number from 1 to 24');
  }
  const day = Number(arg);
  if (day < 1 || day > 24) {
    throw new Error('day must be a whole number from 1 to 24');
  }
  return day;
}

function parseImagePayload(text) {
  let payload = String(text).replace(/\s+/g, '');
  if (!payload) {
    throw new Error('input is empty');
  }
  if (payload.startsWith('data:')) {
    const match = /^data:image\/jpeg;base64,/.exec(payload);
    if (!match) {
      throw new Error('expected a data:image/jpeg;base64 URL');
    }
    payload = payload.slice(match[0].length);
  }
  const buffer = Buffer.from(payload, 'base64');
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    throw new Error('data is not a JPEG image');
  }
  return buffer;
}

function main() {
  let day;
  let buffer;
  try {
    day = parseDay(process.argv[2]);
    buffer = parseImagePayload(fs.readFileSync(0, 'utf8'));
  } catch (err) {
    console.error(`save-image: ${err.message}`);
    process.exit(1);
  }
  const target = path.join(__dirname, '..', 'img', `${day}.jpg`);
  fs.writeFileSync(target, buffer);
  console.log(`Wrote ${target} (${buffer.length} bytes)`);
}

module.exports = { parseDay, parseImagePayload };

if (require.main === module) {
  main();
}
```

- [ ] **Step 4: Add the `Buffer` global to eslint**

In `eslint.config.js`, add after the `process: "readonly"` line (add a comma to it):

```js
        process: "readonly",
        Buffer: "readonly"
```

- [ ] **Step 5: Run tests and the CLI end to end**

Run: `npm test`
Expected: PASS.

Then a CLI smoke test (writes into a temp dir by checking the output path, then removes the file):

```bash
node -e 'process.stdout.write("data:image/jpeg;base64," + Buffer.from([0xff,0xd8,0xff,0xe0,1,2,3,4]).toString("base64"))' | node scripts/save-image.js 24 && ls -l img/24.jpg && rm img/24.jpg
echo "oops" | node scripts/save-image.js 24; echo "exit=$?"
echo "x" | node scripts/save-image.js ../x; echo "exit=$?"
```
Expected: first command prints `Wrote .../img/24.jpg (8 bytes)` and lists the file (then removed); the next two print a `save-image:` error and `exit=1`. Run `git status --short img` afterwards: expected empty (no stray file; there was no `img/24.jpg` before).

- [ ] **Step 6: Fix the clipboard command in the spec**

In the spec's "Saving the photo" section replace the line starting with ``` `pbpaste | node scripts/save-image.js <day>` ``` with:

```
`<clipboard command> | node scripts/save-image.js <day>` (for example `wl-paste` on Wayland or
`xclip -o -selection clipboard` on X11; `pbpaste` on macOS) reads the base64 data URL from
stdin and writes `img/<day>.jpg`. The script also accepts raw base64 and base64 hard-wrapped by
an email client, and refuses anything that is not a JPEG or a day outside 1 to 24.
```
and remove the now-duplicated "reads the base64 data URL from stdin and writes `img/<day>.jpg`." remainder of the old sentence.

- [ ] **Step 7: Commit**

```bash
git add scripts/save-image.js test/save-image.test.js eslint.config.js docs/superpowers/specs/2026-10-12-day-submission-form-design.md
git commit -m "Add save-image script for photos from form emails

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Form page, map picker, live preview (no photo, no sending yet)

**Files:**
- Create: `form.html`
- Create: `css/form.css`
- Create: `js/form.js`

**Interfaces:**
- Consumes: `window.LOCATIONS` (Task 1), `window.CalendarCard.renderCard` (Task 2), `window.FormLib.sanitizeDescription` (Task 3), Leaflet `L`.
- Produces (inside `form.js`, used by Task 6): `state = { lat, lng, imageDataUrl }`, `isEdit`, `editKey`, `existing`, `$()`, `refresh()`, `busy` flag, `canSubmit()`.
- Element IDs (Task 6 relies on them): `dayForm`, `day`, `dayGroup`, `description`, `previewDescription`, `photo`, `photoError`, `map`, `locationStatus`, `locationsList`, `name`, `email`, `phone`, `submitBtn`, `status`, `fallback`, `fallbackText`, `copyBtn`, radios `name="previewMode"` with values `before` and `full`.

- [ ] **Step 1: Create `form.html`**

```html
<!doctype html>
<html lang="fi">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Luukun lomake – Littoisten Joulukalenteri</title>
  <link rel="stylesheet" href="css/style.css?v=202511293">
  <link rel="stylesheet" href="css/form.css?v=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>

<body>
  <header>
    <h1 id="formTitle">🎄 Ehdota luukkua 🎄</h1>
    <p id="formIntro">Täytä tiedot, valitse sijainti kartalta ja tarkista esikatselu. Lähetä lopuksi lomake, niin ylläpitäjä saa sen sähköpostiin.</p>
  </header>

  <main>
    <section id="blocked" class="list-section" hidden>
      <h2>Linkki ei kelpaa</h2>
      <p>Tämä muokkauslinkki ei toimi. Pyydä kalenterin ylläpitäjältä uusi linkki.</p>
    </section>

    <form id="dayForm" novalidate>
      <section class="list-section form-section">
        <h2>Luukun tiedot</h2>

        <label id="dayGroup">Mikä päivä? Voit ehdottaa useampaa vaihtoehtoa ja kirjoittaa huomioita.
          <input type="text" id="day" name="day" required maxlength="200">
        </label>

        <label>Kuvaus
          <textarea id="description" name="description" required rows="8" maxlength="3000"></textarea>
        </label>
        <p class="hint">Voit lihavoida tekstiä kirjoittamalla &lt;b&gt;näin&lt;/b&gt;. Muut HTML-merkit näytetään tekstinä.</p>

        <label>Ennakkoteksti (valinnainen)
          <textarea id="previewDescription" name="previewDescription" rows="3" maxlength="600"></textarea>
        </label>
        <p class="hint">Näkyy kalenterissa ennen luukun päivää, esimerkiksi kellonaika. Jos jätät tyhjäksi, luukku ei näy ennen päivää.</p>

        <label>Kuva (valinnainen)
          <input type="file" id="photo" accept="image/*">
        </label>
        <p id="photoError" class="status error"></p>
      </section>

      <section class="map-section">
        <h2>Sijainti</h2>
        <p class="hint">Napauta karttaa, niin merkki siirtyy kohtaan. Voit vielä vetää merkkiä.</p>
        <div id="map"></div>
        <p id="locationStatus" class="hint">Sijaintia ei ole vielä valittu.</p>
      </section>

      <section class="list-section form-section">
        <h2>Esikatselu</h2>
        <div class="preview-toggle">
          <label><input type="radio" name="previewMode" value="full" checked> Luukun päivänä</label>
          <label><input type="radio" name="previewMode" value="before"> Ennen päivää</label>
        </div>
        <div id="locationsList"></div>
      </section>

      <section class="list-section form-section">
        <h2>Yhteystiedot</h2>
        <p class="hint">Näitä ei näytetä kalenterissa. Ne tulevat vain ylläpitäjälle.</p>
        <label>Nimi
          <input type="text" id="name" name="name" required autocomplete="name">
        </label>
        <label>Sähköposti
          <input type="email" id="email" name="email" required autocomplete="email">
        </label>
        <label>Puhelin
          <input type="tel" id="phone" name="phone" required autocomplete="tel">
        </label>

        <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display: none;">

        <button type="submit" id="submitBtn" class="submit-btn" disabled>Lähetä</button>
        <p id="status" class="status" role="status"></p>

        <div id="fallback" class="fallback" hidden>
          <p class="hint">Voit kopioida tämän tekstin talteen ja toimittaa sen ylläpitäjälle.</p>
          <textarea id="fallbackText" readonly rows="10"></textarea>
          <button type="button" id="copyBtn" class="submit-btn">Kopioi teksti</button>
        </div>
      </section>
    </form>
  </main>

  <script src="js/locations.js?v=1"></script>
  <script src="js/card.js?v=1"></script>
  <script src="js/form-lib.js?v=1"></script>
  <script src="js/form.js?v=1"></script>
</body>

</html>
```

- [ ] **Step 2: Create `css/form.css`**

```css
[hidden] {
  display: none !important;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.form-section input[type="text"],
.form-section input[type="email"],
.form-section input[type="tel"],
.form-section input[type="file"],
.form-section textarea {
  display: block;
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.6rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font: inherit;
  font-weight: 400;
}

.hint {
  margin: 0.25rem 0 1rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.preview-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.preview-toggle label {
  font-weight: 400;
}

.preview-note {
  color: #4a5568;
  font-style: italic;
}

.submit-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 8px;
  background: #c53030;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status.error {
  color: #c53030;
}

.status.success {
  color: #276749;
}

.fallback textarea {
  width: 100%;
  font-family: monospace;
}
```

- [ ] **Step 3: Create `js/form.js`**

```js
// Day submission form: modes, map picker, live preview.
(function () {
  'use strict';

  const { renderCard } = window.CalendarCard;
  const { sanitizeDescription } = window.FormLib;

  const DEFAULT_CENTER = [60.4502, 22.4112];

  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  const editKey = params.get('key');
  const existing = isEdit
    ? window.LOCATIONS.find(loc => loc.day === parseInt(params.get('day'), 10))
    : null;

  const state = { lat: null, lng: null, imageDataUrl: null };
  let busy = false;

  const $ = id => document.getElementById(id);

  function showBlocked() {
    $('dayForm').hidden = true;
    $('blocked').hidden = false;
  }

  function setupMode() {
    if (!isEdit) return;
    $('formTitle').textContent = `🎄 Muokkaa luukkua ${existing.day} 🎄`;
    $('formIntro').textContent = 'Muokkaa tietoja, tarkista esikatselu ja lähetä lomake.';
    $('dayGroup').hidden = true;
    $('day').required = false;
    $('description').value = existing.description || '';
    $('previewDescription').value = existing.previewDescription || '';
  }

  function setLocationStatus() {
    $('locationStatus').textContent = state.lat === null
      ? 'Sijaintia ei ole vielä valittu.'
      : 'Sijainti valittu.';
  }

  function initMap() {
    const hasStart = existing && Number.isFinite(existing.lat) && Number.isFinite(existing.lng);
    const map = L.map('map').setView(hasStart ? [existing.lat, existing.lng] : DEFAULT_CENTER, hasStart ? 18 : 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    let marker = null;
    function place(latlng) {
      state.lat = latlng.lat;
      state.lng = latlng.lng;
      if (marker) {
        marker.setLatLng(latlng);
      } else {
        marker = L.marker(latlng, { draggable: true }).addTo(map);
        marker.on('dragend', () => place(marker.getLatLng()));
      }
      refresh();
    }
    map.on('click', e => place(e.latlng));
    if (hasStart) place(L.latLng(existing.lat, existing.lng));
  }

  function currentLocation() {
    return {
      day: isEdit ? existing.day : '?',
      description: sanitizeDescription($('description').value),
      previewDescription: sanitizeDescription($('previewDescription').value),
      image: existing ? existing.image : undefined
    };
  }

  function renderPreview() {
    const showPreview = document.querySelector('input[name="previewMode"]:checked').value === 'before';
    const location = currentLocation();
    if (showPreview && !location.previewDescription) {
      $('locationsList').innerHTML = '<p class="preview-note">Ennakkotekstiä ei ole, joten luukku ei näy kalenterissa ennen päivää.</p>';
      return;
    }
    $('locationsList').innerHTML = renderCard(location, {
      variant: 'list',
      showPreview,
      imageUrl: state.imageDataUrl || undefined
    });
  }

  function canSubmit() {
    return !busy && state.lat !== null && $('dayForm').checkValidity();
  }

  function refresh() {
    setLocationStatus();
    renderPreview();
    $('submitBtn').disabled = !canSubmit();
  }

  function init() {
    if (isEdit && (!existing || !editKey)) {
      showBlocked();
      return;
    }
    setupMode();
    initMap();
    $('dayForm').addEventListener('input', refresh);
    $('dayForm').addEventListener('change', refresh);
    refresh();
  }

  init();
})();
```

- [ ] **Step 4: Run lint and tests**

Run: `npm test && npx eslint js/form.js`
Expected: tests pass; eslint prints no errors (a `no-unused-vars` warning for `editKey` is expected until Task 6 and is acceptable).

- [ ] **Step 5: Verify in browser**

With `python3 -m http.server 8000` running:

1. `http://localhost:8000/form.html`: day field shown, empty form, Send disabled. Typing a description updates the preview card (badge `?`, date line `joulukuuta 2025`, default image). Clicking the map places a draggable marker and shows "Sijainti valittu."; Send stays disabled until every contact field and the day and description are filled, then enables. Toggle "Ennen päivää" with empty preview text shows the italic note; add preview text and it shows that text with the default image.
2. Type `<script>alert(1)</script> <b>lihava</b>` in the description: preview shows the script as text and `lihava` in bold, no alert.
3. `http://localhost:8000/form.html?day=12&key=abc&edit=1`: title "Muokkaa luukkua 12", day field hidden, description pre-filled, marker at the existing location, preview shows day 12's card; Send enabled after the contact fields are filled.
4. Each of `?edit=1`, `?day=12&edit=1`, `?day=99&key=abc&edit=1`: shows "Linkki ei kelpaa" and no form.
5. Narrow the browser to phone width: layout stays usable.

- [ ] **Step 6: Commit**

```bash
git add form.html css/form.css js/form.js
git commit -m "Add day submission form with map picker and live preview

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Photo resizing and Web3Forms submission

**Files:**
- Modify: `js/form.js`
- Modify: `eslint.config.js` (add `FormData`, `Image`, `navigator` globals)

**Interfaces:**
- Consumes: Task 5 internals (`state`, `isEdit`, `editKey`, `existing`, `$`, `refresh`, `busy`, `canSubmit`) and `window.FormLib.buildSnippet` (Task 3).
- Produces: complete `form.js`. Email fields sent: `access_key`, `subject`, `mode`, `day` (typed text in new mode, number in edit mode), `key` (edit only), `name`, `email`, `phone`, `description` (raw), `previewDescription` (raw), `snippet`, `image` (data URL, only if chosen), `botcheck` (only if the honeypot was checked).

**Prerequisite from the author:** the Web3Forms access key (created at web3forms.com for the email address that should receive submissions) and agreement to send one real test submission in Step 8. The key is public in the page by design; remind the author to restrict it to their site's domain in the Web3Forms dashboard.

- [ ] **Step 1: Add eslint globals**

In `eslint.config.js` globals add (mind the commas):

```js
        FormData: "readonly",
        Image: "readonly",
        navigator: "readonly",
```

- [ ] **Step 2: Import `buildSnippet` and add constants**

In `js/form.js` change the destructuring and add constants:

```js
  const { renderCard } = window.CalendarCard;
  const { sanitizeDescription, buildSnippet } = window.FormLib;

  const ENDPOINT = 'https://api.web3forms.com/submit';
  const ACCESS_KEY = '<<WEB3FORMS_ACCESS_KEY>>';
  const MAX_IMAGE_SIDE = 800;
  const MAX_IMAGE_CHARS = 200000;
```

- [ ] **Step 3: Insert the photo, snippet and submit functions**

Insert immediately above `function init() {`:

```js
  // Resize in the browser so the base64 stays small enough for an email text field.
  // Modern browsers apply EXIF orientation when drawing an <img> to a canvas.
  async function resizeImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Kuvaa ei voitu lukea. Kokeile toista kuvaa.'));
        img.src = url;
      });
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      let quality = 0.7;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length > MAX_IMAGE_CHARS && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      return dataUrl;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function onPhotoChange() {
    const file = $('photo').files[0];
    $('photoError').textContent = '';
    if (!file) {
      state.imageDataUrl = null;
      refresh();
      return;
    }
    try {
      state.imageDataUrl = await resizeImage(file);
    } catch (err) {
      state.imageDataUrl = null;
      $('photo').value = '';
      $('photoError').textContent = err.message;
    }
    refresh();
  }

  function snippetImage() {
    if (state.imageDataUrl) return isEdit ? `${existing.day}.jpg` : '0.jpg';
    return isEdit && existing.image ? existing.image : null;
  }

  function setBusy(value) {
    busy = value;
    $('submitBtn').textContent = value ? 'Lähetetään...' : 'Lähetä';
    refresh();
  }

  function showFallback(snippet) {
    $('fallbackText').value = snippet;
    $('fallback').hidden = false;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit()) return;
    setBusy(true);
    $('status').className = 'status';
    $('status').textContent = '';

    const snippet = buildSnippet({
      mode: isEdit ? 'edit' : 'new',
      day: isEdit ? existing.day : null,
      dayText: $('day').value,
      image: snippetImage(),
      description: $('description').value,
      previewDescription: $('previewDescription').value,
      lat: state.lat,
      lng: state.lng
    });

    const formData = new FormData($('dayForm'));
    formData.set('access_key', ACCESS_KEY);
    formData.set('mode', isEdit ? 'edit' : 'new');
    formData.set('subject', isEdit
      ? `Joulukalenteri: muokkaus luukku ${existing.day}`
      : 'Joulukalenteri: uusi luukkuehdotus');
    if (isEdit) {
      formData.set('day', String(existing.day));
      formData.set('key', editKey);
    }
    formData.set('snippet', snippet);
    if (state.imageDataUrl) formData.set('image', state.imageDataUrl);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || response.statusText);
      }
      $('status').className = 'status success';
      $('status').textContent = 'Kiitos! Lomake lähetettiin.';
      Array.from($('dayForm').elements).forEach(el => { el.disabled = true; });
    } catch (err) {
      $('status').className = 'status error';
      $('status').textContent = `Lähetys epäonnistui (${err.message}). Yritä uudelleen tai kopioi teksti alta.`;
      showFallback(snippet);
      setBusy(false);
    }
  }

  async function copyFallback() {
    try {
      await navigator.clipboard.writeText($('fallbackText').value);
      $('copyBtn').textContent = 'Kopioitu';
    } catch {
      $('fallbackText').select();
    }
  }

```

- [ ] **Step 4: Wire the new handlers in `init`**

In `init`, after the `change` listener line and before `refresh();`, add:

```js
    $('photo').addEventListener('change', onPhotoChange);
    $('dayForm').addEventListener('submit', onSubmit);
    $('copyBtn').addEventListener('click', copyFallback);
```

- [ ] **Step 5: Set the real access key**

Replace `<<WEB3FORMS_ACCESS_KEY>>` with the key from the author, then verify:

```bash
grep -c "<<" js/form.js
```
Expected: `0`.

- [ ] **Step 6: Lint and test**

Run: `npm test && npx eslint js/form.js`
Expected: tests pass; eslint clean.

- [ ] **Step 7: Verify photo handling in the browser**

At `http://localhost:8000/form.html`: choose a large photo (several MB). Expected: preview card shows it immediately; no error text. Choose a non-image or unreadable file (rename a `.txt` to `.jpg`): expected red message under the photo field, file cleared, preview back to default image. In edit mode with no new photo the preview keeps the existing image.

- [ ] **Step 8: Real submission test (with the author's agreement)**

1. New mode: fill everything, pick a large photo, click the map, tick nothing hidden, press Lähetä. Expected: "Kiitos! Lomake lähetettiin." and an email containing `snippet`, `image`, `name`, `email`, `phone`, `day`, `mode`. **If the submission is rejected or the `image` field is truncated or missing, stop and report to the author: the base64 field size limit is the known risk (spec fallback: upload to an image host and send a URL).**
2. Copy the `image` value from the email and run it through the script, then open the result:

```bash
wl-paste | node scripts/save-image.js 24
```
(or `xclip -o -selection clipboard`). Expected: `Wrote .../img/24.jpg`, and the file opens as the chosen photo at about 800 px. **Delete `img/24.jpg` afterwards** (`rm img/24.jpg`; `git status --short img` must be empty).
3. Paste the `snippet` into `js/locations.js` temporarily and confirm it is valid JS (open `index.html` with `?preview_all=on` and check the console), then revert that edit (`git checkout js/locations.js`).
4. Edit mode: open `form.html?day=12&key=test&edit=1`, change the text, submit. Expected: email subject "muokkaus luukku 12", `key` field present, `snippet` starting with `day: 12,`.
5. Simulate failure: stop the network (or temporarily change `ENDPOINT` to an invalid URL), submit. Expected: red error, entered data intact, fallback textarea with the snippet and a working copy button. Restore `ENDPOINT`.
6. Honeypot: in devtools tick the hidden `botcheck` checkbox (`document.querySelector('[name=botcheck]').checked = true`) and submit. Expected: Web3Forms rejects it (error shown, no email).

- [ ] **Step 9: Commit**

```bash
git add js/form.js eslint.config.js
git commit -m "Add photo resizing and Web3Forms submission to the form

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Build output and final checks

**Files:**
- Modify: `webpack.config.prod.js` (copy list)

**Interfaces:**
- Consumes: all previous files.
- Produces: production build that includes the form and its scripts.

- [ ] **Step 1: Add the new files to the copy list**

In `webpack.config.prod.js`, add to the `patterns` array after the `js/vendor` entry:

```js
        { from: 'js/locations.js', to: 'js/locations.js' },
        { from: 'js/card.js', to: 'js/card.js' },
        { from: 'js/form-lib.js', to: 'js/form-lib.js' },
        { from: 'js/form.js', to: 'js/form.js' },
        { from: 'form.html', to: 'form.html' },
```

(`css` is already copied wholesale, which covers `css/form.css`.)

- [ ] **Step 2: Build and inspect**

Run: `npm run build && ls dist dist/js`
Expected: build succeeds; `dist/form.html` and `dist/js/{locations,card,form-lib,form}.js` exist. `dist/js/app.js` is the bundled app. Do not commit `dist` (it is gitignored).

- [ ] **Step 3: Full test run and clean tree check**

Run: `npm test && git status --short`
Expected: all tests pass; `git status` shows only `webpack.config.prod.js` modified.

- [ ] **Step 4: Final browser pass on the built output**

Run: `npx --yes http-server dist -p 8001` (or `python3 -m http.server 8001 --directory dist`), open `http://localhost:8001/?preview_all=on` and `http://localhost:8001/form.html`.
Expected: both pages work from `dist` with no console errors (the map picker, preview and a card click on the main page).

- [ ] **Step 5: Commit**

```bash
git add webpack.config.prod.js
git commit -m "Include the form and shared scripts in the production build

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec coverage: modes and links (Tasks 5, 6), blocked edit link (Task 5), botcheck honeypot (Tasks 5, 6), fields and optional photo (Tasks 5, 6), map-only location and disabled Send (Task 5), mandatory contact fields (Task 5), `<b>`-only HTML (Task 3, used in 5, 6), preview toggle and `?` badge (Tasks 2, 5), shared modules and `app.js` refactor with version bumps (Tasks 1, 2), webpack copy list (Task 7), email contents (Task 6), `save-image.js` (Task 4), error fallback (Task 6), unit tests and manual checks including the base64 size test (Tasks 3, 4, 6), `2025/` untouched (all tasks).
- Spec gaps resolved here: the new-mode image name is unknown, so it is `0.jpg` with a rename comment (recorded in the spec, Task 3); the save-image clipboard command is generic because the author is on Linux (recorded in the spec, Task 4).
- Not in scope and left alone: the site's year text (`Littoisten Joulukalenteri 2025` in `index.html` and `YEAR` in `js/card.js`), which will need updating for the new season.
