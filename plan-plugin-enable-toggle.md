# Plan: Plugin Enable/Disable Toggle

## Goal

Add a menu toggle that turns the plugin on or off as a whole, using the existing settings and command-palette behavior as the foundation.

## Current State

- `showSettings()` already exposes an `Effect: On/Off` setting in `index.ts:997-1007`
- the command palette already exposes `Enable Matrix rain` / `Disable Matrix rain` in `index.ts:1216-1237`
- persisted settings already include `enabled` in `DEFAULT_SETTINGS`, `Settings`, `readSettings()`, and `persistSettings()` in `index.ts:70-105` and `index.ts:304-330`
- runtime rendering already checks `settings.enabled` in:
  - `introActive()` (`index.ts:873-875`)
  - `syncLive()` (`index.ts:911-923`)
  - `updateSettings()` cleanup branches (`index.ts:952-974`)

## Desired Behavior

- users can toggle the entire plugin from the settings menu
- turning the plugin off stops the rain effect, prevents live rendering, and suppresses intro/text-fall behavior
- turning the plugin back on restores the configured behavior without losing other saved preferences

## Implementation Steps

### 1. Decide the menu wording

Keep the existing first menu item, but consider renaming it for clarity:

- current: `Effect: On/Off`
- possible replacement: `Plugin enabled: On/Off`
- alternative: `Matrix rain: On/Off`

Recommended choice: `Plugin enabled: On/Off`

### 2. Treat `settings.enabled` as the single source of truth

Use the existing `enabled` setting as the master switch everywhere.

Review and keep these paths aligned:

- `readSettings()` for persisted load
- `persistSettings()` for persisted save
- `syncLive()` for live renderer activation
- `introActive()` and intro startup/reset behavior
- text-settle cleanup in `updateSettings()`

No separate second toggle should be introduced unless there is a need to distinguish between:

- plugin installed but visually idle
- plugin completely disabled

For the current request, `enabled` is sufficient.

### 3. Confirm disabled-state behavior is complete

When toggled off:

- live rendering should stop via `api.renderer.dropLive()` through `syncLive()`
- intro timers should be cleared
- session text effects should be reset
- no route should continue to render the effect

The existing code already does most of this, so this step is primarily a verification and small cleanup pass.

### 4. Decide how much of the menu stays visible while disabled

Two valid UX options:

#### Option A: keep all settings visible

- users can configure scope, density, intro, theme, etc. while disabled
- re-enabling applies the saved configuration immediately

#### Option B: show a minimal disabled menu

- only show the enable toggle and close/back options when disabled
- reduces clutter, but hides useful configuration

Recommended choice: **Option A**

This keeps the settings dialog predictable and avoids making the menu jump around too much.

### 5. Keep the settings dialog and command palette behavior consistent

Use the same messaging and toggle logic in both places:

- settings menu toggle should update state and refresh the dialog
- command palette toggle should continue to show a toast
- both should reuse the same `updateSettings({ enabled: ... })` path

### 6. Update docs if wording changes

If the menu label changes from `Effect` to something clearer, update:

- `README.md` features/settings section
- any screenshots or screencast notes if they show the old wording

## Validation Checklist

- toggle off from settings menu disables the visual effect immediately
- toggle on from settings menu restores the effect immediately
- toggle off suppresses intro replay/startup behavior
- toggle off resets session text-settle activity
- command palette toggle still works
- plugin state persists across restarts via KV
- menu labels and toast text match the final wording

## Risk Level

Low.

The underlying state model already exists; this is mostly a UX clarification and verification task.

## Recommended Scope

- keep the current `enabled` setting
- rename the menu item for clarity if desired
- verify all behavior is fully gated by `settings.enabled`
- avoid introducing a second concept of "plugin disabled"
