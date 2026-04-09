# Plan: Accent Color Selector

## Goal

Add a menu control that lets users switch the plugin from the default green accent to other preset colors, while keeping the bundled theme and animated overlay visually consistent.

## Current State

The current green accent is implemented in two different layers.

### 1. Bundled OpenCode theme files

- `matrix-console.json`
- `matrix-console-opaque.json`

In both files, green is centralized in `defs.green = "#5DFF88"` and then reused by theme tokens such as:

- `theme.primary`
- `theme.success`
- `theme.borderActive`
- `theme.diffAdded`
- `theme.markdownCode`

### 2. Hardcoded renderer colors in `index.ts`

The animated matrix rain and intro UI use fixed RGB values directly in code, including:

- `paintColumn()` in `index.ts:439-479`
- `addGlow()` / `applyGlow()` in `index.ts:524-558`
- `paintIntroBackdrop()` in `index.ts:565-583`
- text-settle rendering around `index.ts:707-746`
- intro text colors in `paintIntroText()` in `index.ts:815-856`

Because of this split, changing accent color requires updating both:

- the installed OpenCode theme
- the live-rendered overlay palette

## Constraints

- the plugin theme API is file-based: `theme.install(path)` installs a theme from a JSON file path
- `theme.set(name)` selects an installed theme by name
- there is no documented parameterized runtime theme API for "same theme, different accent"
- a runtime accent selector therefore needs either:
  - multiple prebuilt theme JSON variants, or
  - generated theme JSON files written/installed at runtime

Recommended approach: **ship prebuilt variants**.

## Recommended UX

Use a preset selector, not a free-form color picker.

Example presets:

- Green
- Cyan
- Blue
- Purple
- Amber
- Red

This keeps the experience simple and avoids palette combinations that look bad in the TUI.

## Implementation Steps

### 1. Add a persisted accent color setting

Extend settings in `index.ts` with an enum-like field, for example:

- `type AccentColor = ...`
- `accentColor: AccentColor`

Update:

- `DEFAULT_SETTINGS`
- `Settings`
- `readSettings()`
- `persistSettings()`

Also add labels and choices, following the existing menu patterns:

- `ACCENT_LABEL`
- `ACCENT_CHOICES`

### 2. Add a settings-menu control

Add a new row in `showSettings()` such as:

- `Accent color: Green`

Use `openChoice(...)` just like the existing:

- `Scope`
- `Route profile`
- `Density`
- `Speed`

Behavior:

- selecting a new preset updates the saved setting immediately
- the settings screen reopens with the new current value
- the render refreshes so the color change is visible immediately

### 3. Centralize the in-code render palette

Replace hardcoded RGB literals with a palette resolver, for example:

- `resolveAccentPalette(settings)`

That palette should define the tones needed by the renderer, such as:

- bright head glyph
- mid trail glyph
- dark trail glyph
- glow contribution
- intro background tint
- intro header text
- intro frame text
- progress/status text
- session text-settle tones

This gives one place to tune each accent preset.

### 4. Refactor render call sites to use the palette

Update the renderer functions to pull colors from the centralized palette instead of inline tuples.

Primary targets:

- `paintColumn()`
- `addGlow()`
- `paintIntroBackdrop()`
- text-settle rendering
- `paintIntroText()`

Result:

- all animated visuals follow the selected accent preset
- the palette becomes easier to tweak later without hunting through the file

### 5. Add theme variants for each accent

Because OpenCode themes are file-backed, add matching JSON theme files for each preset and transparency mode.

Example naming pattern:

- `matrix-console-green.json`
- `matrix-console-green-opaque.json`
- `matrix-console-cyan.json`
- `matrix-console-cyan-opaque.json`
- etc.

Each variant should adjust the relevant theme `defs` and dependent tokens while preserving the overall Matrix look.

### 6. Generalize theme selection helpers

Replace the current transparency-only theme selection helpers with logic that depends on both:

- `accentColor`
- `backgroundTransparency`

The current helpers are:

- `preferredThemeName(settings)`
- `applyPreferredTheme(api, settings)`
- `ensureTheme(api, settings)`

Recommended refactor:

- introduce a helper that returns `{ name, path }` for the currently preferred theme variant
- install all bundled variants in `ensureTheme()`
- keep `applyPreferredTheme()` responsible for switching when one of the plugin themes is currently active

### 7. Update live switching behavior

When `accentColor` changes:

- persist the new setting
- if the selected OpenCode theme is one of this plugin's themes, switch to the matching variant
- request a render refresh so the animated overlay recolors immediately

This should mirror the current `backgroundTransparency` switching behavior in `updateSettings()`.

### 8. Update documentation

Update `README.md` to document:

- the new accent color selector
- the list of available presets
- any updated theme naming or behavior

## Validation Checklist

- accent selection persists across restarts
- settings menu shows the current preset correctly
- changing accent updates overlay colors immediately
- changing accent updates bundled theme selection when the plugin theme is active
- transparent and opaque variants both work for every preset
- intro, rain, glow, and session text all use the selected palette
- non-plugin themes are not forcibly overridden unless the user explicitly chooses the plugin theme

## Risk Level

Medium.

The main complexity is keeping the theme JSON variants and the live-rendered overlay palette visually aligned.

## Recommended Scope

### Phase 1

- add preset-based accent selection
- support a small curated set of colors
- centralize the renderer palette
- ship matching transparent/opaque theme variants

### Phase 2

- expand the preset list if needed
- consider generated theme files only if static variants become too hard to maintain

## Recommendation

Implement this as a preset-based selector backed by:

- one persisted `accentColor` setting
- one centralized in-code palette resolver
- one static bundled theme variant per accent/transparency combination

This is the lowest-risk way to make the color selector feel cohesive across both the theme layer and the animated matrix overlay.
