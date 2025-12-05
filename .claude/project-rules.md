# Project Rules

## Cache Busting for JavaScript Changes

**IMPORTANT**: Whenever you modify `js/app.js`, you MUST also update the version parameter in `index.html`.

### How to update the version:

1. Find the script tag in `index.html`: `<script src="js/app.js?v=XXXXXX"></script>`
2. Increment the version number (XXXXXX) by 1
3. This forces browsers to reload the new JavaScript file instead of using cached versions

### Example:
- Before: `<script src="js/app.js?v=2044345"></script>`
- After: `<script src="js/app.js?v=2044346"></script>`

This ensures users always see the latest changes to the advent calendar.
