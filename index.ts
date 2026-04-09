const THEME_NAME = "matrix-console"
const OPAQUE_THEME_NAME = "matrix-console-opaque"
const themePath = (file: string) => {
  const pathname = decodeURIComponent(new URL(file, import.meta.url).pathname)
  return /^\/[A-Za-z]:/.test(pathname) ? pathname.slice(1) : pathname
}
const THEME_PATH = themePath("./matrix-console.json")
const OPAQUE_THEME_PATH = themePath("./matrix-console-opaque.json")
const THEME_VARIANTS = {
  green: {
    transparent: { name: THEME_NAME, path: THEME_PATH },
    opaque: { name: OPAQUE_THEME_NAME, path: OPAQUE_THEME_PATH },
  },
  cyan: {
    transparent: { name: "matrix-console-cyan", path: themePath("./matrix-console-cyan.json") },
    opaque: { name: "matrix-console-cyan-opaque", path: themePath("./matrix-console-cyan-opaque.json") },
  },
  blue: {
    transparent: { name: "matrix-console-blue", path: themePath("./matrix-console-blue.json") },
    opaque: { name: "matrix-console-blue-opaque", path: themePath("./matrix-console-blue-opaque.json") },
  },
  purple: {
    transparent: { name: "matrix-console-purple", path: themePath("./matrix-console-purple.json") },
    opaque: { name: "matrix-console-purple-opaque", path: themePath("./matrix-console-purple-opaque.json") },
  },
  amber: {
    transparent: { name: "matrix-console-amber", path: themePath("./matrix-console-amber.json") },
    opaque: { name: "matrix-console-amber-opaque", path: themePath("./matrix-console-amber-opaque.json") },
  },
  yellow: {
    transparent: { name: "matrix-console-yellow", path: themePath("./matrix-console-yellow.json") },
    opaque: { name: "matrix-console-yellow-opaque", path: themePath("./matrix-console-yellow-opaque.json") },
  },
  pink: {
    transparent: { name: "matrix-console-pink", path: themePath("./matrix-console-pink.json") },
    opaque: { name: "matrix-console-pink-opaque", path: themePath("./matrix-console-pink-opaque.json") },
  },
  red: {
    transparent: { name: "matrix-console-red", path: themePath("./matrix-console-red.json") },
    opaque: { name: "matrix-console-red-opaque", path: themePath("./matrix-console-red-opaque.json") },
  },
} as const
const PLUGIN_THEME_NAMES = new Set(
  Object.values(THEME_VARIANTS).flatMap((variant) => [variant.transparent.name, variant.opaque.name]),
)
const PLUGIN_THEME_PATHS = Array.from(
  new Set(Object.values(THEME_VARIANTS).flatMap((variant) => [variant.transparent.path, variant.opaque.path])),
)
const SETTINGS_KEY = "matrix-rain.settings"
const ENABLED_KEY = "matrix-rain.enabled"
const THEME_READY_KEY = "matrix-rain.theme-ready"
const PREVIOUS_THEME_KEY = "matrix-rain.previous-theme"
const DEFAULT_THEME_NAME = "opencode"
const GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-=<>[]{}|\\"
const EMPTY = 0
const SPACE = 32

const INTRO_FRAME = [
  "+--------------------------------+",
  "|        ENTER THE MATRIX        |",
  "|     TERMINAL LINK ENGAGED      |",
  "+--------------------------------+",
]

const DENSITY_VALUE = {
  off: 0,
  light: 0.24,
  medium: 0.4,
  heavy: 0.6,
} as const

const SPEED_VALUE = {
  slow: 0.75,
  normal: 1,
  fast: 1.35,
} as const

const INTRO_VALUE = {
  short: 1500,
  normal: 2600,
  long: 4200,
} as const

const SCOPE_LABEL = {
  home: "Home only",
  all: "Everywhere",
} as const

const PAINT_LABEL = {
  empty: "Empty cells only",
  overlay: "Overlay all text",
} as const

const DENSITY_LABEL = {
  off: "Off",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
} as const

const SPEED_LABEL = {
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
} as const

const INTRO_LABEL = {
  short: "Short",
  normal: "Normal",
  long: "Long",
} as const

const PROFILE_LABEL = {
  adaptive: "Route-aware",
  uniform: "Uniform",
} as const

const ACCENT_LABEL = {
  green: "Green",
  cyan: "Cyan",
  blue: "Blue",
  purple: "Purple",
  amber: "Amber",
  yellow: "Yellow",
  pink: "Pink",
  red: "Red",
} as const

const DEFAULT_SETTINGS = {
  enabled: true,
  accentColor: "green",
  backgroundTransparency: true,
  scope: "all",
  paint: "empty",
  density: "medium",
  speed: "normal",
  intro: true,
  introLength: "normal",
  profile: "adaptive",
  scanlines: true,
  glow: true,
  textFall: true,
} as const

type Scope = keyof typeof SCOPE_LABEL
type PaintMode = keyof typeof PAINT_LABEL
type Density = keyof typeof DENSITY_LABEL
type Speed = keyof typeof SPEED_LABEL
type IntroLength = keyof typeof INTRO_LABEL
type ProfileMode = keyof typeof PROFILE_LABEL
type AccentColor = keyof typeof ACCENT_LABEL

type Settings = {
  enabled: boolean
  accentColor: AccentColor
  backgroundTransparency: boolean
  scope: Scope
  paint: PaintMode
  density: Density
  speed: Speed
  intro: boolean
  introLength: IntroLength
  profile: ProfileMode
  scanlines: boolean
  glow: boolean
  textFall: boolean
}

type TextDrop = {
  x: number
  y: number
  startY: number
  age: number
  duration: number
  trail: number
}

type Column = {
  active: boolean
  head: number
  speed: number
  length: number
}

type State = {
  live: boolean
  width: number
  height: number
  columns: Column[]
  introStartedAt: number
  introEndsAt: number
  elapsed: number
  sceneKey: string
  textDrops: Map<number, TextDrop>
  prevChars: Uint32Array | null
  prevWidth: number
  prevHeight: number
  prevRoute: string
}

type FrameContext = {
  route: string
  now: number
  dt: number
}

type RenderProfile = {
  key: string
  density: number
  speed: number
  paint: PaintMode
  scanline: number
  glow: number
  palette: AccentPalette
}

type Choice<Value extends string> = {
  title: string
  value: Value
  description: string
}

type ThemeVariant = {
  name: string
  path: string
}

type Rgb = [number, number, number]
type Rgba = [number, number, number, number]

type AccentPalette = {
  head: Rgb
  bright: Rgb
  mid: Rgb
  dim: Rgb
  deep: Rgb
  glow: Rgb
  scan: Rgb
}

const SCOPE_CHOICES: Choice<Scope>[] = [
  {
    title: SCOPE_LABEL.home,
    value: "home",
    description: "Keep the rain on the home screen only.",
  },
  {
    title: SCOPE_LABEL.all,
    value: "all",
    description: "Apply the rain across the whole UI.",
  },
]

const PAINT_CHOICES: Choice<PaintMode>[] = [
  {
    title: PAINT_LABEL.empty,
    value: "empty",
    description: "Draw only in gaps so the UI stays readable.",
  },
  {
    title: PAINT_LABEL.overlay,
    value: "overlay",
    description: "Let the rain fall over existing text too.",
  },
]

const DENSITY_CHOICES: Choice<Density>[] = [
  {
    title: DENSITY_LABEL.off,
    value: "off",
    description: "Turn off the rain while keeping the plugin enabled.",
  },
  {
    title: DENSITY_LABEL.light,
    value: "light",
    description: "Sparse ambient rain.",
  },
  {
    title: DENSITY_LABEL.medium,
    value: "medium",
    description: "Balanced Matrix look.",
  },
  {
    title: DENSITY_LABEL.heavy,
    value: "heavy",
    description: "Dense columns across the screen.",
  },
]

const SPEED_CHOICES: Choice<Speed>[] = [
  {
    title: SPEED_LABEL.slow,
    value: "slow",
    description: "Gentle falling motion.",
  },
  {
    title: SPEED_LABEL.normal,
    value: "normal",
    description: "Default Matrix pace.",
  },
  {
    title: SPEED_LABEL.fast,
    value: "fast",
    description: "More aggressive motion.",
  },
]

const INTRO_CHOICES: Choice<IntroLength>[] = [
  {
    title: INTRO_LABEL.short,
    value: "short",
    description: "A quick flash on startup.",
  },
  {
    title: INTRO_LABEL.normal,
    value: "normal",
    description: "The default fullscreen intro.",
  },
  {
    title: INTRO_LABEL.long,
    value: "long",
    description: "A longer cinematic intro.",
  },
]

const PROFILE_CHOICES: Choice<ProfileMode>[] = [
  {
    title: PROFILE_LABEL.adaptive,
    value: "adaptive",
    description: "Heavier on home, subtler in sessions.",
  },
  {
    title: PROFILE_LABEL.uniform,
    value: "uniform",
    description: "Use the same intensity on every route.",
  },
]

const ACCENT_CHOICES: Choice<AccentColor>[] = [
  {
    title: ACCENT_LABEL.green,
    value: "green",
    description: "The original green-phosphor Matrix look.",
  },
  {
    title: ACCENT_LABEL.cyan,
    value: "cyan",
    description: "A cool cyan terminal glow.",
  },
  {
    title: ACCENT_LABEL.blue,
    value: "blue",
    description: "A deeper electric-blue variant.",
  },
  {
    title: ACCENT_LABEL.purple,
    value: "purple",
    description: "A violet neon interpretation.",
  },
  {
    title: ACCENT_LABEL.amber,
    value: "amber",
    description: "A warm amber CRT style.",
  },
  {
    title: ACCENT_LABEL.yellow,
    value: "yellow",
    description: "A bright monochrome monitor glow.",
  },
  {
    title: ACCENT_LABEL.pink,
    value: "pink",
    description: "A neon magenta terminal glow.",
  },
  {
    title: ACCENT_LABEL.red,
    value: "red",
    description: "A true high-alert red variant.",
  },
]

const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
  green: {
    head: [0.92, 1, 0.88],
    bright: [0.48, 0.96, 0.58],
    mid: [0.18, 0.72, 0.34],
    dim: [0.04, 0.18, 0.05],
    deep: [0.01, 0.11, 0.04],
    glow: [0.24, 0.88, 0.3],
    scan: [0.18, 0.92, 0.28],
  },
  cyan: {
    head: [0.86, 0.98, 1],
    bright: [0.44, 0.9, 0.98],
    mid: [0.14, 0.62, 0.78],
    dim: [0.04, 0.16, 0.22],
    deep: [0.01, 0.07, 0.1],
    glow: [0.14, 0.76, 0.9],
    scan: [0.12, 0.78, 0.92],
  },
  blue: {
    head: [0.88, 0.93, 1],
    bright: [0.48, 0.68, 0.98],
    mid: [0.18, 0.4, 0.82],
    dim: [0.03, 0.09, 0.22],
    deep: [0.01, 0.04, 0.1],
    glow: [0.16, 0.38, 0.9],
    scan: [0.12, 0.34, 0.88],
  },
  purple: {
    head: [0.96, 0.88, 1],
    bright: [0.78, 0.5, 0.98],
    mid: [0.48, 0.22, 0.82],
    dim: [0.14, 0.05, 0.22],
    deep: [0.06, 0.02, 0.1],
    glow: [0.72, 0.26, 0.9],
    scan: [0.66, 0.2, 0.84],
  },
  amber: {
    head: [1, 0.96, 0.84],
    bright: [0.98, 0.78, 0.36],
    mid: [0.82, 0.54, 0.12],
    dim: [0.22, 0.12, 0.02],
    deep: [0.1, 0.05, 0.01],
    glow: [0.92, 0.52, 0.12],
    scan: [0.9, 0.58, 0.16],
  },
  yellow: {
    head: [1, 1, 0.88],
    bright: [0.98, 0.9, 0.42],
    mid: [0.82, 0.72, 0.16],
    dim: [0.24, 0.18, 0.03],
    deep: [0.11, 0.08, 0.01],
    glow: [0.92, 0.82, 0.14],
    scan: [0.92, 0.84, 0.18],
  },
  pink: {
    head: [1, 0.92, 0.92],
    bright: [0.98, 0.54, 0.58],
    mid: [0.82, 0.22, 0.28],
    dim: [0.22, 0.05, 0.06],
    deep: [0.1, 0.02, 0.03],
    glow: [0.92, 0.24, 0.28],
    scan: [0.88, 0.18, 0.22],
  },
  red: {
    head: [1, 0.9, 0.9],
    bright: [1, 0.32, 0.24],
    mid: [0.92, 0.08, 0.06],
    dim: [0.28, 0.02, 0.02],
    deep: [0.12, 0.01, 0.01],
    glow: [1, 0.06, 0.04],
    scan: [0.96, 0.04, 0.03],
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function mix(valueA: number, valueB: number, weight: number) {
  const ratio = clamp(weight, 0, 1)
  return valueA + (valueB - valueA) * ratio
}

function mixRgb(start: Rgb, end: Rgb, weight: number): Rgb {
  return [
    mix(start[0], end[0], weight),
    mix(start[1], end[1], weight),
    mix(start[2], end[2], weight),
  ]
}

function scaleRgb(color: Rgb, factor: number): Rgb {
  return [
    clamp(color[0] * factor, 0, 1),
    clamp(color[1] * factor, 0, 1),
    clamp(color[2] * factor, 0, 1),
  ]
}

function toRgba(color: Rgb, alpha = 1): Rgba {
  return [color[0], color[1], color[2], alpha]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function readEnum<Value extends string>(value: unknown, labels: Record<Value, string>, fallback: Value) {
  if (typeof value !== "string") return fallback
  if (!Object.prototype.hasOwnProperty.call(labels, value)) return fallback
  return value as Value
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1))
}

function pickGlyph() {
  return GLYPHS.charCodeAt(randomInt(0, GLYPHS.length - 1))
}

function densityValue(settings: Settings) {
  return DENSITY_VALUE[settings.density]
}

function speedValue(settings: Settings) {
  return SPEED_VALUE[settings.speed]
}

function introDuration(settings: Settings) {
  return INTRO_VALUE[settings.introLength]
}

function accentPalette(settings: Pick<Settings, "accentColor">) {
  return ACCENT_PALETTES[settings.accentColor]
}

function preferredThemeVariant(settings: Pick<Settings, "accentColor" | "backgroundTransparency">): ThemeVariant {
  const variant = THEME_VARIANTS[settings.accentColor]
  return settings.backgroundTransparency ? variant.transparent : variant.opaque
}

function preferredThemeName(settings: Pick<Settings, "accentColor" | "backgroundTransparency">) {
  return preferredThemeVariant(settings).name
}

function matrixThemeSelected(api: any) {
  return typeof api.theme.selected === "string" && PLUGIN_THEME_NAMES.has(api.theme.selected)
}

function rememberPreviousTheme(api: any) {
  const themeName = typeof api.theme.selected === "string" ? api.theme.selected : ""
  if (!themeName || PLUGIN_THEME_NAMES.has(themeName)) return false
  api.kv.set(PREVIOUS_THEME_KEY, themeName)
  return true
}

function restorePreviousTheme(api: any) {
  const themeName = api.kv.get(PREVIOUS_THEME_KEY, undefined)
  if (typeof themeName !== "string" || !themeName || !api.theme.has(themeName)) return false
  if (api.theme.selected === themeName) return false
  api.theme.set(themeName)
  return true
}

function restoreDefaultTheme(api: any) {
  if (!api.theme.has(DEFAULT_THEME_NAME) || api.theme.selected === DEFAULT_THEME_NAME) return false
  api.theme.set(DEFAULT_THEME_NAME)
  return true
}

function applyPreferredTheme(api: any, settings: Pick<Settings, "accentColor" | "backgroundTransparency">) {
  const themeName = preferredThemeName(settings)
  if (!api.theme.has(themeName) || api.theme.selected === themeName) return false
  api.theme.set(themeName)
  return true
}

function activatePluginTheme(api: any, settings: Pick<Settings, "accentColor" | "backgroundTransparency">) {
  const themeName = preferredThemeName(settings)
  if (!api.theme.has(themeName)) return false
  rememberPreviousTheme(api)
  if (api.theme.selected !== themeName) {
    api.theme.set(themeName)
  }
  api.kv.set(THEME_READY_KEY, true)
  return true
}

function deactivatePluginTheme(api: any) {
  if (!matrixThemeSelected(api)) return false
  return restorePreviousTheme(api) || restoreDefaultTheme(api)
}

function shouldRecoverPluginTheme(api: any) {
  const themeName = typeof api.theme.selected === "string" ? api.theme.selected : ""
  if (!themeName) return true
  if (themeName === DEFAULT_THEME_NAME) return true
  if (!api.theme.has(themeName)) return true
  return false
}

function currentRouteName(api: any) {
  return typeof api.route.current?.name === "string" ? api.route.current.name : "unknown"
}

function readSettings(api: any): Settings {
  const stored = api.kv.get(SETTINGS_KEY, undefined)
  const settings = isRecord(stored) ? stored : {}
  const legacyEnabled = api.kv.get(ENABLED_KEY, DEFAULT_SETTINGS.enabled) !== false

  return {
    enabled: typeof settings.enabled === "boolean" ? settings.enabled : legacyEnabled,
    accentColor: readEnum(settings.accentColor, ACCENT_LABEL, DEFAULT_SETTINGS.accentColor),
    backgroundTransparency:
      typeof settings.backgroundTransparency === "boolean"
        ? settings.backgroundTransparency
        : DEFAULT_SETTINGS.backgroundTransparency,
    scope: readEnum(settings.scope, SCOPE_LABEL, DEFAULT_SETTINGS.scope),
    paint: readEnum(settings.paint, PAINT_LABEL, DEFAULT_SETTINGS.paint),
    density: readEnum(settings.density, DENSITY_LABEL, DEFAULT_SETTINGS.density),
    speed: readEnum(settings.speed, SPEED_LABEL, DEFAULT_SETTINGS.speed),
    intro: typeof settings.intro === "boolean" ? settings.intro : DEFAULT_SETTINGS.intro,
    introLength: readEnum(settings.introLength, INTRO_LABEL, DEFAULT_SETTINGS.introLength),
    profile: readEnum(settings.profile, PROFILE_LABEL, DEFAULT_SETTINGS.profile),
    scanlines: typeof settings.scanlines === "boolean" ? settings.scanlines : DEFAULT_SETTINGS.scanlines,
    glow: typeof settings.glow === "boolean" ? settings.glow : DEFAULT_SETTINGS.glow,
    textFall: typeof settings.textFall === "boolean" ? settings.textFall : DEFAULT_SETTINGS.textFall,
  }
}

function persistSettings(api: any, settings: Settings) {
  api.kv.set(SETTINGS_KEY, settings)
  api.kv.set(ENABLED_KEY, settings.enabled)
}

function resolveRenderProfile(route: string, settings: Settings): RenderProfile {
  let density = densityValue(settings)
  let speed = speedValue(settings)
  let scanline = settings.scanlines ? 0.12 : 0
  let glow = settings.glow ? 0.13 : 0

  if (settings.profile === "adaptive") {
    if (route === "home") {
      density *= 1.35
      speed *= 1.08
      scanline *= 1.12
      glow *= 1.15
    } else if (route === "session") {
      density *= 0.55
      speed *= 0.82
      scanline *= 0.72
      glow *= 0.65
    } else {
      density *= 0.75
      speed *= 0.9
      scanline *= 0.85
      glow *= 0.8
    }
  }

  return {
    key: [
      settings.profile === "adaptive" ? route : "uniform",
      settings.profile,
      settings.density,
      settings.speed,
      settings.accentColor,
      settings.paint,
      settings.scanlines ? "scan" : "clean",
      settings.glow ? "glow" : "plain",
    ].join(":"),
    density: clamp(density, 0, 0.86),
    speed: clamp(speed, 0.45, 1.8),
    paint: settings.paint,
    scanline: clamp(scanline, 0, 0.22),
    glow: clamp(glow, 0, 0.2),
    palette: accentPalette(settings),
  }
}

function resolveIntroProfile(settings: Settings): RenderProfile {
  return {
    key: [
      "intro",
      settings.accentColor,
      settings.density,
      settings.speed,
      settings.scanlines ? "scan" : "clean",
      settings.glow ? "glow" : "plain",
    ].join(":"),
    density: clamp(densityValue(settings) * 1.5, 0, 0.9),
    speed: clamp(speedValue(settings) * 1.16, 0.7, 1.9),
    paint: "overlay",
    scanline: settings.scanlines ? 0.18 : 0,
    glow: settings.glow ? 0.17 : 0,
    palette: accentPalette(settings),
  }
}

function createColumn(height: number, profile: RenderProfile): Column {
  const length = randomInt(6, 18)
  return {
    active: Math.random() < profile.density,
    head: randomBetween(-height * 0.35, height + length * 0.2),
    speed: randomBetween(8, 22) * profile.speed,
    length,
  }
}

function resetColumn(column: Column, height: number, profile: RenderProfile) {
  column.active = Math.random() < profile.density
  column.length = randomInt(6, 18)
  column.speed = randomBetween(8, 22) * profile.speed
  column.head = -randomBetween(4, height + column.length + 16)
}

function resetScene(state: State) {
  state.width = 0
  state.height = 0
  state.columns = []
  state.sceneKey = ""
}

function resetTextFx(state: State) {
  state.textDrops.clear()
  state.prevChars = null
  state.prevWidth = 0
  state.prevHeight = 0
  state.prevRoute = ""
}

function ensurePrevChars(state: State, size: number) {
  if (!state.prevChars || state.prevChars.length !== size) {
    state.prevChars = new Uint32Array(size)
  }

  return state.prevChars
}

function syncState(state: State, width: number, height: number, profile: RenderProfile) {
  if (state.width === width && state.height === height && state.sceneKey === profile.key) return

  state.width = width
  state.height = height
  state.sceneKey = profile.key
  state.columns = Array.from({ length: width }, () => createColumn(height, profile))
}

function paintColor(target: Float32Array, index: number, r: number, g: number, b: number, a: number) {
  target[index] = r
  target[index + 1] = g
  target[index + 2] = b
  target[index + 3] = a
}

function addColor(target: Float32Array, index: number, r: number, g: number, b: number, a: number) {
  target[index] = clamp(target[index] + r, 0, 1)
  target[index + 1] = clamp(target[index + 1] + g, 0, 1)
  target[index + 2] = clamp(target[index + 2] + b, 0, 1)
  target[index + 3] = clamp(target[index + 3] + a, 0, 1)
}

function paintRgba(target: Float32Array, index: number, color: Rgba) {
  paintColor(target, index, color[0], color[1], color[2], color[3])
}

function shouldPaintCell(existing: number, paint: PaintMode) {
  return paint === "overlay" || existing === EMPTY || existing === SPACE
}

function paintColumn(buffer: any, x: number, column: Column, profile: RenderProfile) {
  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const head = Math.floor(column.head)
  const { paint, palette } = profile
  const headColor = palette.head
  const brightColor = palette.bright
  const midColor = palette.mid
  const dimColor = palette.dim
  const dimToMidR = midColor[0] - dimColor[0]
  const dimToMidG = midColor[1] - dimColor[1]
  const dimToMidB = midColor[2] - dimColor[2]

  for (let offset = 0; offset < column.length; offset++) {
    const y = head - offset
    if (y < 0 || y >= height) continue

    if (offset > 1 && Math.random() > 1 - offset / column.length) continue

    const cellIndex = y * width + x
    const existing = chars[cellIndex]
    if (!shouldPaintCell(existing, paint)) continue

    const fade = 1 - offset / column.length
    const colorIndex = cellIndex * 4
    chars[cellIndex] = pickGlyph()

    if (offset === 0) {
      paintColor(fg, colorIndex, headColor[0], headColor[1], headColor[2], 1)
      continue
    }

    if (offset < 3) {
      paintColor(fg, colorIndex, brightColor[0], brightColor[1], brightColor[2], 1)
      continue
    }

    paintColor(
      fg,
      colorIndex,
      dimColor[0] + dimToMidR * fade,
      dimColor[1] + dimToMidG * fade,
      dimColor[2] + dimToMidB * fade,
      1,
    )
  }
}

function renderRain(buffer: any, state: State, profile: RenderProfile, dt: number) {
  syncState(state, buffer.width as number, buffer.height as number, profile)

  for (let x = 0; x < state.columns.length; x++) {
    const column = state.columns[x]
    column.head += column.speed * dt

    if (column.head - column.length > state.height + 1) {
      resetColumn(column, state.height, profile)
    }

    if (!column.active) continue
    paintColumn(buffer, x, column, profile)
  }
}

function applyScanlines(buffer: any, elapsed: number, strength: number, palette: AccentPalette) {
  if (strength <= 0) return

  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const sweep = ((elapsed * 12) % (height + 8)) - 4
  const scan = palette.scan

  for (let y = 0; y < height; y++) {
    const lineShade = y % 2 === 0 ? strength * 0.08 : strength * 0.2
    const sweepWeight = Math.max(0, 1 - Math.abs(y - sweep) / 2.6) * strength
    const fgMulR = 1 - lineShade
    const fgMulG = 1 - lineShade * 0.45
    const fgMulB = fgMulR
    const bgMulR = 1 - lineShade * 0.15
    const bgMulG = 1 - lineShade * 0.08
    const bgMulB = bgMulR
    const rowBase = y * width * 4

    if (sweepWeight <= 0) {
      for (let colorIndex = rowBase, rowEnd = rowBase + width * 4; colorIndex < rowEnd; colorIndex += 4) {
        fg[colorIndex] = clamp(fg[colorIndex] * fgMulR, 0, 1)
        fg[colorIndex + 1] = clamp(fg[colorIndex + 1] * fgMulG, 0, 1)
        fg[colorIndex + 2] = clamp(fg[colorIndex + 2] * fgMulB, 0, 1)
        bg[colorIndex] = clamp(bg[colorIndex] * bgMulR, 0, 1)
        bg[colorIndex + 1] = clamp(bg[colorIndex + 1] * bgMulG, 0, 1)
        bg[colorIndex + 2] = clamp(bg[colorIndex + 2] * bgMulB, 0, 1)
      }
      continue
    }

    const sweepAddFgR = sweepWeight * scan[0] * 0.08
    const sweepAddFgG = sweepWeight * scan[1] * 0.08
    const sweepAddFgB = sweepWeight * scan[2] * 0.08
    const sweepAddBgG = sweepWeight * scan[1] * 0.018
    const sweepAddBgB = sweepWeight * scan[2] * 0.004

    for (let colorIndex = rowBase, rowEnd = rowBase + width * 4; colorIndex < rowEnd; colorIndex += 4) {
      fg[colorIndex] = clamp(fg[colorIndex] * fgMulR + sweepAddFgR, 0, 1)
      fg[colorIndex + 1] = clamp(fg[colorIndex + 1] * fgMulG + sweepAddFgG, 0, 1)
      fg[colorIndex + 2] = clamp(fg[colorIndex + 2] * fgMulB + sweepAddFgB, 0, 1)
      bg[colorIndex] = clamp(bg[colorIndex] * bgMulR, 0, 1)
      bg[colorIndex + 1] = clamp(bg[colorIndex + 1] * bgMulG + sweepAddBgG, 0, 1)
      bg[colorIndex + 2] = clamp(bg[colorIndex + 2] * bgMulB + sweepAddBgB, 0, 1)
    }
  }
}

function applyGlow(buffer: any, strength: number, palette: AccentPalette) {
  if (strength <= 0) return

  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const glow = palette.glow
  const glowMax = Math.max(glow[0], glow[1], glow[2], 0.0001)
  const accentR = glow[0] / glowMax
  const accentG = glow[1] / glowMax
  const accentB = glow[2] / glowMax
  const glowR = glow[0]
  const glowG = glow[1]
  const glowB = glow[2]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex = (y * width + x) * 4
      const alpha = fg[colorIndex + 3]
      if (alpha <= 0) continue

      const red = fg[colorIndex]
      const green = fg[colorIndex + 1]
      const blue = fg[colorIndex + 2]
      const brightness = Math.max(red, green, blue)
      if (brightness * strength * 0.7 < 0.015) continue

      const colorMax = Math.max(brightness, 0.0001)
      const invColorMax = 1 / colorMax
      const distance =
        Math.abs(red * invColorMax - accentR) +
        Math.abs(green * invColorMax - accentG) +
        Math.abs(blue * invColorMax - accentB)
      const alignment = clamp(1 - distance / 2.25, 0, 1)
      const energy = clamp(brightness * alignment * strength * 0.7, 0, 0.18)
      if (energy < 0.015) continue

      addColor(fg, colorIndex, glowR * energy * 0.22, glowG * energy * 0.22, glowB * energy * 0.22, 0)

      let nextR = bg[colorIndex] + glowR * energy * 0.15
      let nextG = bg[colorIndex + 1] + glowG * energy * 0.15
      let nextB = bg[colorIndex + 2] + glowB * energy * 0.15
      let nextA = bg[colorIndex + 3] + energy * 0.28
      bg[colorIndex] = nextR > 1 ? 1 : nextR
      bg[colorIndex + 1] = nextG > 1 ? 1 : nextG
      bg[colorIndex + 2] = nextB > 1 ? 1 : nextB
      bg[colorIndex + 3] = nextA > 1 ? 1 : nextA

      if (x > 0) {
        const leftIndex = colorIndex - 4
        const leftEnergy = energy * 0.45
        nextR = bg[leftIndex] + glowR * leftEnergy * 0.15
        nextG = bg[leftIndex + 1] + glowG * leftEnergy * 0.15
        nextB = bg[leftIndex + 2] + glowB * leftEnergy * 0.15
        nextA = bg[leftIndex + 3] + leftEnergy * 0.28
        bg[leftIndex] = nextR > 1 ? 1 : nextR
        bg[leftIndex + 1] = nextG > 1 ? 1 : nextG
        bg[leftIndex + 2] = nextB > 1 ? 1 : nextB
        bg[leftIndex + 3] = nextA > 1 ? 1 : nextA
      }

      if (x + 1 < width) {
        const rightIndex = colorIndex + 4
        const rightEnergy = energy * 0.45
        nextR = bg[rightIndex] + glowR * rightEnergy * 0.15
        nextG = bg[rightIndex + 1] + glowG * rightEnergy * 0.15
        nextB = bg[rightIndex + 2] + glowB * rightEnergy * 0.15
        nextA = bg[rightIndex + 3] + rightEnergy * 0.28
        bg[rightIndex] = nextR > 1 ? 1 : nextR
        bg[rightIndex + 1] = nextG > 1 ? 1 : nextG
        bg[rightIndex + 2] = nextB > 1 ? 1 : nextB
        bg[rightIndex + 3] = nextA > 1 ? 1 : nextA
      }

      if (y > 0) {
        const upIndex = colorIndex - width * 4
        const upEnergy = energy * 0.32
        nextR = bg[upIndex] + glowR * upEnergy * 0.15
        nextG = bg[upIndex + 1] + glowG * upEnergy * 0.15
        nextB = bg[upIndex + 2] + glowB * upEnergy * 0.15
        nextA = bg[upIndex + 3] + upEnergy * 0.28
        bg[upIndex] = nextR > 1 ? 1 : nextR
        bg[upIndex + 1] = nextG > 1 ? 1 : nextG
        bg[upIndex + 2] = nextB > 1 ? 1 : nextB
        bg[upIndex + 3] = nextA > 1 ? 1 : nextA
      }

      if (y + 1 < height) {
        const downIndex = colorIndex + width * 4
        const downEnergy = energy * 0.32
        nextR = bg[downIndex] + glowR * downEnergy * 0.15
        nextG = bg[downIndex + 1] + glowG * downEnergy * 0.15
        nextB = bg[downIndex + 2] + glowB * downEnergy * 0.15
        nextA = bg[downIndex + 3] + downEnergy * 0.28
        bg[downIndex] = nextR > 1 ? 1 : nextR
        bg[downIndex + 1] = nextG > 1 ? 1 : nextG
        bg[downIndex + 2] = nextB > 1 ? 1 : nextB
        bg[downIndex + 3] = nextA > 1 ? 1 : nextA
      }
    }
  }
}

function applyPostFx(buffer: any, state: State, profile: RenderProfile) {
  applyGlow(buffer, profile.glow, profile.palette)
  applyScanlines(buffer, state.elapsed, profile.scanline, profile.palette)
}

function paintIntroBackdrop(buffer: any, palette: AccentPalette) {
  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const fgColor = mixRgb(palette.deep, palette.dim, 0.55)
  const topBg = scaleRgb(palette.deep, 0.4)
  const bottomBg = scaleRgb(palette.mid, 0.14)
  const fgR = fgColor[0]
  const fgG = fgColor[1]
  const fgB = fgColor[2]
  const bgDeltaR = bottomBg[0] - topBg[0]
  const bgDeltaG = bottomBg[1] - topBg[1]
  const bgDeltaB = bottomBg[2] - topBg[2]

  for (let y = 0; y < height; y++) {
    const fade = y / Math.max(1, height - 1)
    const bgR = topBg[0] + bgDeltaR * fade
    const bgG = topBg[1] + bgDeltaG * fade
    const bgB = topBg[2] + bgDeltaB * fade

    for (let x = 0; x < width; x++) {
      const cellIndex = y * width + x
      const colorIndex = cellIndex * 4
      chars[cellIndex] = SPACE
      paintColor(fg, colorIndex, fgR, fgG, fgB, 1)
      paintColor(bg, colorIndex, bgR, bgG, bgB, 1)
    }
  }
}

function paintText(buffer: any, x: number, y: number, text: string, color: Rgba) {
  if (y < 0 || y >= (buffer.height as number)) return

  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number

  for (let index = 0; index < text.length; index++) {
    const px = x + index
    if (px < 0 || px >= width) continue

    const cellIndex = y * width + px
    chars[cellIndex] = text.charCodeAt(index)
    paintRgba(fg, cellIndex * 4, color)
  }
}

function easeOutCubic(value: number) {
  const progress = clamp(value, 0, 1)
  return 1 - (1 - progress) ** 3
}

function textFxEnabled(route: string, settings: Settings) {
  return settings.enabled && settings.textFall && settings.scope === "all" && route === "session"
}

function snapshotChars(state: State, chars: Uint32Array, width: number, height: number, route: string) {
  const prevChars = ensurePrevChars(state, chars.length)
  prevChars.set(chars)
  state.prevWidth = width
  state.prevHeight = height
  state.prevRoute = route
}

function visibleCell(char: number) {
  return char !== EMPTY && char !== SPACE
}

function syncTextDrops(buffer: any, state: State, settings: Settings, route: string) {
  const chars = buffer.buffers.char as Uint32Array
  const width = buffer.width as number
  const height = buffer.height as number

  if (!textFxEnabled(route, settings)) {
    resetTextFx(state)
    return
  }

  if (
    !state.prevChars ||
    state.prevWidth !== width ||
    state.prevHeight !== height ||
    state.prevRoute !== route
  ) {
    state.textDrops.clear()
    snapshotChars(state, chars, width, height, route)
    return
  }

  const maxNewDrops = 160
  const maxDrops = 900
  let created = 0

  if (state.textDrops.size > maxDrops) {
    for (const [index] of state.textDrops) {
      state.textDrops.delete(index)
      if (state.textDrops.size <= maxDrops) break
    }
  }

  for (let index = 0; index < chars.length; index++) {
    const current = chars[index]
    const previous = state.prevChars[index]
    if (current === previous) continue

    if (!visibleCell(current)) {
      state.textDrops.delete(index)
      continue
    }

    if (created >= maxNewDrops) continue

    const x = index % width
    const y = Math.floor(index / width)
    const rise = Math.min(3, y)
    state.textDrops.set(index, {
      x,
      y,
      startY: y - randomInt(0, rise),
      age: 0,
      duration: randomBetween(80, 180) / speedValue(settings),
      trail: randomInt(1, 3),
    })
    created++
  }

  snapshotChars(state, chars, width, height, route)
}

function renderTextDrops(buffer: any, state: State, profile: RenderProfile, deltaTime: number) {
  if (!state.textDrops.size) return

  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const palette = profile.palette
  const headColor = palette.head
  const brightColor = palette.bright
  const midColor = palette.mid
  const dimColor = palette.dim
  const dimToMidR = midColor[0] - dimColor[0]
  const dimToMidG = midColor[1] - dimColor[1]
  const dimToMidB = midColor[2] - dimColor[2]

  for (const [cellIndex, drop] of state.textDrops) {
    if (drop.x >= width || drop.y >= height) {
      state.textDrops.delete(cellIndex)
      continue
    }

    drop.age += deltaTime
    const progress = clamp(drop.age / drop.duration, 0, 1)
    const eased = easeOutCubic(progress)
    const targetIndex = drop.y * width + drop.x
    const headY = Math.round(drop.startY + (drop.y - drop.startY) * eased)
    const trail = Math.max(1, Math.round((1 - progress) * drop.trail) + 1)

    if (progress < 0.88) {
      chars[targetIndex] = progress > 0.7 ? pickGlyph() : SPACE
      const settleIndex = targetIndex * 4
      if (progress > 0.7) {
        paintColor(fg, settleIndex, brightColor[0], brightColor[1], brightColor[2], 1)
      } else {
        const settleFade = 0.4 + progress * 0.35
        paintColor(
          fg,
          settleIndex,
          dimColor[0] + dimToMidR * settleFade,
          dimColor[1] + dimToMidG * settleFade,
          dimColor[2] + dimToMidB * settleFade,
          1,
        )
      }
    } else {
      addColor(fg, targetIndex * 4, dimColor[0] * 0.6, dimColor[1] * 0.6, dimColor[2] * 0.6, 0)
    }

    for (let offset = 0; offset < trail; offset++) {
      const y = headY - offset
      if (y < 0 || y >= height) continue

      const index = y * width + drop.x
      const colorIndex = index * 4

      if (index !== targetIndex) {
        const existing = chars[index]
        if (existing !== EMPTY && existing !== SPACE) continue
      }

      chars[index] = pickGlyph()

      if (offset === 0) {
        paintColor(fg, colorIndex, headColor[0], headColor[1], headColor[2], 1)
        continue
      }

      const fade = 1 - offset / trail
      paintColor(
        fg,
        colorIndex,
        dimColor[0] + dimToMidR * fade,
        dimColor[1] + dimToMidG * fade,
        dimColor[2] + dimToMidB * fade,
        1,
      )
    }

    if (progress >= 1) {
      state.textDrops.delete(cellIndex)
    }
  }
}

function scrambleLine(text: string, reveal: number) {
  if (reveal >= 1) return text

  let total = 0
  for (const char of text) {
    if (char !== " ") total++
  }

  let visible = Math.floor(total * clamp(reveal, 0, 1))
  let result = ""

  for (const char of text) {
    if (char === " ") {
      result += char
      continue
    }

    if (visible > 0) {
      result += char
      visible--
      continue
    }

    result += String.fromCharCode(pickGlyph())
  }

  return result
}

function paintCenteredLine(buffer: any, y: number, text: string, color: Rgba, reveal = 1) {
  const line = scrambleLine(text, reveal)
  const x = Math.floor(((buffer.width as number) - line.length) / 2)
  paintText(buffer, x, y, line, color)
}

function progressBar(progress: number, width: number) {
  const filled = Math.floor(clamp(progress, 0, 1) * width)
  return `[${"#".repeat(filled)}${".".repeat(width - filled)}]`
}

function introStatus(settings: Settings) {
  return [
    settings.profile === "adaptive" ? "route-aware" : "uniform",
    settings.scanlines ? "scanlines on" : "scanlines off",
    settings.glow ? "glow on" : "glow off",
  ].join(" // ")
}

function introProgress(state: State, settings: Settings, now: number) {
  const duration = introDuration(settings)
  if (!state.introStartedAt || duration <= 0) return 1
  return clamp((now - state.introStartedAt) / duration, 0, 1)
}

function paintIntroText(buffer: any, state: State, settings: Settings, palette: AccentPalette, now: number) {
  const width = buffer.width as number
  const height = buffer.height as number
  const progress = introProgress(state, settings, now)
  const headerY = Math.max(1, Math.floor(height * 0.18))
  const frameY = Math.max(headerY + 3, Math.floor(height * 0.42) - 2)
  const footerY = Math.min(height - 4, frameY + INTRO_FRAME.length + 2)
  const statusY = Math.min(height - 2, footerY + 2)
  const percent = String(Math.round(progress * 100)).padStart(3, "0")
  const headerColor = toRgba(mixRgb(palette.mid, palette.bright, 0.55))
  const subtitleColor = toRgba(mixRgb(palette.dim, palette.mid, 0.85))
  const frameBaseColor = toRgba(mixRgb(palette.dim, palette.mid, 0.75))
  const progressColor = toRgba(palette.bright)
  const statusColor = toRgba(mixRgb(palette.dim, palette.mid, 0.7))

  paintCenteredLine(buffer, headerY, "SECURE CHANNEL // OPENCODE", headerColor, clamp(progress * 1.5, 0, 1))
  paintCenteredLine(
    buffer,
    headerY + 1,
    "MATRIX RAIN PROTOCOL INITIALIZING",
    subtitleColor,
    clamp(progress * 1.6 - 0.08, 0, 1),
  )

  for (let index = 0; index < INTRO_FRAME.length; index++) {
    const line = INTRO_FRAME[index]
    const reveal = clamp(progress * 1.35 - index * 0.05, 0, 1)
    const color = index === 1 ? toRgba(palette.head) : index === 2 ? toRgba(palette.bright) : frameBaseColor
    paintCenteredLine(buffer, frameY + index, line, color, reveal)
  }

  paintCenteredLine(
    buffer,
    footerY,
    `${progressBar(progress, 24)} ${percent}%`,
    progressColor,
    clamp(progress * 1.8 - 0.2, 0, 1),
  )
  paintCenteredLine(buffer, statusY, introStatus(settings), statusColor, clamp(progress * 1.8 - 0.32, 0, 1))

  if (width > 68) {
    paintText(buffer, 2, 2, scrambleLine("renderer synchronized", clamp(progress * 1.7, 0, 1)), subtitleColor)
    const right = scrambleLine(`scope ${settings.scope} // paint ${settings.paint}`, clamp(progress * 1.7 - 0.05, 0, 1))
    paintText(buffer, width - right.length - 2, 2, right, subtitleColor)
  }
}

function startIntro(state: State, settings: Settings) {
  resetTextFx(state)

  if (!settings.enabled || !settings.intro) {
    state.introStartedAt = 0
    state.introEndsAt = 0
    return
  }

  const now = Date.now()
  state.introStartedAt = now
  state.introEndsAt = now + introDuration(settings)
  resetScene(state)
}

function introActive(state: State, settings: Settings, now: number) {
  return settings.enabled && settings.intro && now < state.introEndsAt
}

function renderIntro(buffer: any, state: State, settings: Settings, profile: RenderProfile, dt: number, now: number) {
  paintIntroBackdrop(buffer, profile.palette)
  renderRain(buffer, state, profile, dt)
  paintIntroText(buffer, state, settings, profile.palette, now)
  applyPostFx(buffer, state, profile)
}

function routeEnabled(route: string, settings: Settings) {
  return settings.scope === "all" || route === "home"
}

async function ensureTheme(api: any, settings: Settings) {
  for (const themePath of PLUGIN_THEME_PATHS) {
    try {
      await api.theme.install(themePath)
    } catch {}
  }

  if (!settings.enabled) return

  if (api.kv.get(THEME_READY_KEY, false) !== true) {
    activatePluginTheme(api, settings)
    return
  }

  if (!matrixThemeSelected(api)) {
    if (shouldRecoverPluginTheme(api)) {
      activatePluginTheme(api, settings)
    }
    return
  }

  applyPreferredTheme(api, settings)
}

function syncLive(api: any, state: State, settings: Settings, frame?: Partial<FrameContext>) {
  const route = frame?.route ?? currentRouteName(api)
  const now = frame?.now ?? Date.now()
  const shouldLive = introActive(state, settings, now) || (settings.enabled && routeEnabled(route, settings))
  if (shouldLive === state.live) return shouldLive

  if (shouldLive) {
    api.renderer.requestLive()
  } else {
    api.renderer.dropLive()
  }

  state.live = shouldLive
  return shouldLive
}

const plugin = {
  id: "matrix-rain",
  async tui(api: any) {
    let settings = readSettings(api)
    await ensureTheme(api, settings)

    const state: State = {
      live: false,
      width: 0,
      height: 0,
      columns: [],
      introStartedAt: 0,
      introEndsAt: 0,
      elapsed: 0,
      sceneKey: "",
      textDrops: new Map(),
      prevChars: null,
      prevWidth: 0,
      prevHeight: 0,
      prevRoute: "",
    }

    const requestRefresh = () => {
      syncLive(api, state, settings)
      api.renderer.requestRender()
    }

    const updateSettings = (patch: Partial<Settings>) => {
      const previousSettings = settings
      settings = { ...settings, ...patch }
      persistSettings(api, settings)

      if (patch.enabled !== undefined && patch.enabled !== previousSettings.enabled) {
        if (settings.enabled) {
          activatePluginTheme(api, settings)
        } else {
          deactivatePluginTheme(api)
        }
      }

      if (
        settings.enabled &&
        (patch.backgroundTransparency !== undefined || patch.accentColor !== undefined) &&
        matrixThemeSelected(api)
      ) {
        applyPreferredTheme(api, settings)
      }

      if (!settings.enabled || !settings.intro) {
        state.introStartedAt = 0
        state.introEndsAt = 0
      }

      if (!settings.enabled || !settings.textFall || settings.scope !== "all") {
        resetTextFx(state)
      }

      if (patch.density || patch.speed || patch.profile || patch.accentColor) {
        resetScene(state)
      }

      requestRefresh()
    }

    const togglePluginEnabled = () => {
      const nextEnabled = !settings.enabled
      updateSettings({ enabled: nextEnabled })
      api.ui.toast({
        variant: "info",
        message: nextEnabled ? "Matrix plugin enabled" : "Matrix plugin disabled",
      })
    }

    const replayIntro = () => {
      startIntro(state, settings)
      requestRefresh()
    }

    const openMenu = (title: string, options: any[], current?: unknown, size: "medium" | "large" | "xlarge" = "large") => {
      api.ui.dialog.setSize(size)
      api.ui.dialog.replace(() =>
        api.ui.DialogSelect({
          title,
          flat: true,
          skipFilter: true,
          current,
          options,
          onSelect(option: { onSelect?: () => void }) {
            option.onSelect?.()
          },
        }),
      )
    }

    const showSettings = () => {
      const options = [
        {
          title: `Plugin enabled: ${settings.enabled ? "On" : "Off"}`,
          value: "effect",
          description: "Turn the Matrix theme and effects on or off.",
          onSelect: () => {
            togglePluginEnabled()
            showSettings()
          },
        },
        {
          title: `Accent color: ${ACCENT_LABEL[settings.accentColor]}`,
          value: "accentColor",
          description: "Choose the Matrix accent palette for the theme and rain.",
          onSelect: () => {
            openChoice("Accent color", ACCENT_CHOICES, settings.accentColor, (value) => {
              updateSettings({ accentColor: value })
              showSettings()
            })
          },
        },
        {
          title: `Background transparency: ${settings.backgroundTransparency ? "On" : "Off"}`,
          value: "backgroundTransparency",
          description: "Toggle the bundled Matrix theme between transparent and opaque backgrounds.",
          onSelect: () => {
            updateSettings({ backgroundTransparency: !settings.backgroundTransparency })
            showSettings()
          },
        },
        settings.enabled && settings.intro
          ? {
              title: "Replay intro now",
              value: "replay",
              description: "Run the fullscreen Matrix intro again.",
              onSelect: () => {
                api.ui.dialog.clear()
                replayIntro()
                api.ui.toast({
                  variant: "info",
                  message: "Replaying Matrix intro",
                })
              },
            }
          : undefined,
        {
          title: `Scope: ${SCOPE_LABEL[settings.scope]}`,
          value: "scope",
          description: "Choose where the rain appears.",
          onSelect: () => {
            openChoice("Rain scope", SCOPE_CHOICES, settings.scope, (value) => {
              updateSettings({ scope: value })
              showSettings()
            })
          },
        },
        {
          title: `Route profile: ${PROFILE_LABEL[settings.profile]}`,
          value: "profile",
          description: "Switch between route-aware and uniform intensity.",
          onSelect: () => {
            openChoice("Route profile", PROFILE_CHOICES, settings.profile, (value) => {
              updateSettings({ profile: value })
              showSettings()
            })
          },
        },
        {
          title: `Paint mode: ${PAINT_LABEL[settings.paint]}`,
          value: "paint",
          description: "Choose whether the rain stays in gaps or overlays text.",
          onSelect: () => {
            openChoice("Paint mode", PAINT_CHOICES, settings.paint, (value) => {
              updateSettings({ paint: value })
              showSettings()
            })
          },
        },
        {
          title: `Density: ${DENSITY_LABEL[settings.density]}`,
          value: "density",
          description: "Control how many columns are active.",
          onSelect: () => {
            openChoice("Density", DENSITY_CHOICES, settings.density, (value) => {
              updateSettings({ density: value })
              showSettings()
            })
          },
        },
        {
          title: `Speed: ${SPEED_LABEL[settings.speed]}`,
          value: "speed",
          description: "Control how quickly the columns move.",
          onSelect: () => {
            openChoice("Speed", SPEED_CHOICES, settings.speed, (value) => {
              updateSettings({ speed: value })
              showSettings()
            })
          },
        },
        {
          title: `Scanlines: ${settings.scanlines ? "On" : "Off"}`,
          value: "scanlines",
          description: "Toggle the CRT-style scanline layer.",
          onSelect: () => {
            updateSettings({ scanlines: !settings.scanlines })
            showSettings()
          },
        },
        {
          title: `Glow: ${settings.glow ? "On" : "Off"}`,
          value: "glow",
          description: "Toggle the phosphor glow around bright glyphs.",
          onSelect: () => {
            updateSettings({ glow: !settings.glow })
            showSettings()
          },
        },
        {
          title: `Session text settle: ${settings.textFall ? "On" : "Off"}`,
          value: "textFall",
          description: "Let newly rendered session text drop into place when scope is Everywhere.",
          onSelect: () => {
            updateSettings({ textFall: !settings.textFall })
            showSettings()
          },
        },
        {
          title: `Intro: ${settings.intro ? "On" : "Off"}`,
          value: "intro",
          description: "Toggle the fullscreen startup intro.",
          onSelect: () => {
            updateSettings({ intro: !settings.intro })
            showSettings()
          },
        },
        settings.intro
          ? {
              title: `Intro length: ${INTRO_LABEL[settings.introLength]}`,
              value: "introLength",
              description: "Choose how long the intro lasts.",
              onSelect: () => {
                openChoice("Intro length", INTRO_CHOICES, settings.introLength, (value) => {
                  updateSettings({ introLength: value })
                  showSettings()
                })
              },
            }
          : undefined,
        settings.enabled && api.theme.selected !== preferredThemeName(settings)
          ? {
              title: "Use matrix-console theme",
              value: "theme",
              description: "Switch the UI to the Matrix theme.",
              onSelect: () => {
                if (!activatePluginTheme(api, settings)) return
                api.renderer.requestRender()
                api.ui.toast({
                  variant: "success",
                  message: `Switched to ${preferredThemeName(settings)} theme`,
                })
                showSettings()
              },
            }
          : undefined,
        {
          title: "Close",
          value: "close",
          description: "Close matrix settings.",
          onSelect: () => {
            api.ui.dialog.clear()
          },
        },
      ].filter(Boolean)

      openMenu("Matrix settings", options)
    }

    const openChoice = <Value extends string>(
      title: string,
      choices: Choice<Value>[],
      current: Value,
      onPick: (value: Value) => void,
    ) => {
      openMenu(
        title,
        [
          ...choices.map((choice) => ({
            title: choice.title,
            value: choice.value,
            description: choice.description,
            onSelect: () => onPick(choice.value),
          })),
          {
            title: "Back",
            value: "back",
            description: "Return to Matrix settings.",
            onSelect: () => showSettings(),
          },
        ],
        current,
        "medium",
      )
    }

    const post = (buffer: any, deltaTime: number) => {
      const frame = {
        route: currentRouteName(api),
        now: Date.now(),
        dt: clamp(deltaTime / 1000, 0.016, 0.11),
      }

      if (!syncLive(api, state, settings, frame)) {
        return
      }

      state.elapsed += frame.dt

      if (settings.enabled && settings.intro && frame.now < state.introEndsAt) {
        renderIntro(buffer, state, settings, resolveIntroProfile(settings), frame.dt, frame.now)
        return
      }

      syncTextDrops(buffer, state, settings, frame.route)

      const profile = resolveRenderProfile(frame.route, settings)
      renderRain(buffer, state, profile, frame.dt)
      renderTextDrops(buffer, state, profile, deltaTime)
      applyPostFx(buffer, state, profile)
    }

    startIntro(state, settings)

    api.command.register(() => [
      {
        title: "Matrix settings",
        value: "plugin.matrix-rain.settings",
        category: "Plugin",
        onSelect: () => showSettings(),
      },
      settings.enabled && settings.intro
        ? {
            title: "Replay Matrix intro",
            value: "plugin.matrix-rain.intro",
            category: "Plugin",
            onSelect: () => {
              replayIntro()
              api.ui.toast({
                variant: "info",
                message: "Replaying Matrix intro",
              })
            },
          }
        : undefined,
      {
        title: "Use matrix-console theme",
        value: "plugin.matrix-rain.theme",
        category: "Plugin",
        hidden: !settings.enabled || api.theme.selected === preferredThemeName(settings),
        onSelect: () => {
          if (!activatePluginTheme(api, settings)) return
          api.renderer.requestRender()
          api.ui.toast({
            variant: "success",
            message: `Switched to ${preferredThemeName(settings)} theme`,
          })
        },
      },
    ].filter(Boolean))

    api.renderer.addPostProcessFn(post)
    requestRefresh()
    api.lifecycle.onDispose(() => {
      state.introStartedAt = 0
      state.introEndsAt = 0
      syncLive(api, state, { ...settings, enabled: false, intro: false })
      api.renderer.removePostProcessFn(post)
    })
  },
}

export default plugin
