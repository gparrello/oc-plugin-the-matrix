const THEME_NAME = "matrix-console"
const THEME_PATH = new URL("./matrix-console.json", import.meta.url).pathname
const SETTINGS_KEY = "matrix-rain.settings"
const ENABLED_KEY = "matrix-rain.enabled"
const THEME_READY_KEY = "matrix-rain.theme-ready"
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

const DEFAULT_SETTINGS = {
  enabled: true,
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

type Settings = {
  enabled: boolean
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

type RenderProfile = {
  key: string
  density: number
  speed: number
  paint: PaintMode
  scanline: number
  glow: number
}

type Choice<Value extends string> = {
  title: string
  value: Value
  description: string
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
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

function currentRouteName(api: any) {
  return typeof api.route.current?.name === "string" ? api.route.current.name : "unknown"
}

function readSettings(api: any): Settings {
  const stored = api.kv.get(SETTINGS_KEY, undefined)
  const settings = isRecord(stored) ? stored : {}
  const legacyEnabled = api.kv.get(ENABLED_KEY, DEFAULT_SETTINGS.enabled) !== false

  return {
    enabled: typeof settings.enabled === "boolean" ? settings.enabled : legacyEnabled,
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

function resolveRenderProfile(api: any, settings: Settings): RenderProfile {
  const route = currentRouteName(api)
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
    key: [route, settings.profile, settings.density, settings.speed].join(":"),
    density: clamp(density, 0.08, 0.86),
    speed: clamp(speed, 0.45, 1.8),
    paint: settings.paint,
    scanline: clamp(scanline, 0, 0.22),
    glow: clamp(glow, 0, 0.2),
  }
}

function resolveIntroProfile(settings: Settings): RenderProfile {
  return {
    key: ["intro", settings.density, settings.speed, settings.scanlines ? "scan" : "clean", settings.glow ? "glow" : "plain"].join(":"),
    density: clamp(densityValue(settings) * 1.5, 0.4, 0.9),
    speed: clamp(speedValue(settings) * 1.16, 0.7, 1.9),
    paint: "overlay",
    scanline: settings.scanlines ? 0.18 : 0,
    glow: settings.glow ? 0.17 : 0,
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

function shouldPaintCell(existing: number, paint: PaintMode) {
  return paint === "overlay" || existing === EMPTY || existing === SPACE
}

function paintColumn(buffer: any, x: number, column: Column, paint: PaintMode) {
  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const head = Math.floor(column.head)

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
      paintColor(fg, colorIndex, 0.92, 1, 0.88, 1)
      continue
    }

    if (offset < 3) {
      paintColor(fg, colorIndex, 0.48, 0.96, 0.58, 1)
      continue
    }

    paintColor(
      fg,
      colorIndex,
      0.04,
      clamp(0.18 + fade * 0.48, 0, 1),
      clamp(0.05 + fade * 0.18, 0, 1),
      1,
    )
  }
}

function renderRain(buffer: any, state: State, profile: RenderProfile, deltaTime: number) {
  syncState(state, buffer.width as number, buffer.height as number, profile)

  const dt = clamp(deltaTime / 1000, 0.016, 0.11)

  for (let x = 0; x < state.columns.length; x++) {
    const column = state.columns[x]
    column.head += column.speed * dt

    if (column.head - column.length > state.height + 1) {
      resetColumn(column, state.height, profile)
    }

    if (!column.active) continue
    paintColumn(buffer, x, column, profile.paint)
  }
}

function applyScanlines(buffer: any, elapsed: number, strength: number) {
  if (strength <= 0) return

  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const sweep = ((elapsed * 12) % (height + 8)) - 4

  for (let y = 0; y < height; y++) {
    const lineShade = y % 2 === 0 ? strength * 0.08 : strength * 0.2
    const sweepWeight = Math.max(0, 1 - Math.abs(y - sweep) / 2.6) * strength

    for (let x = 0; x < width; x++) {
      const colorIndex = (y * width + x) * 4
      fg[colorIndex] = clamp(fg[colorIndex] * (1 - lineShade) + sweepWeight * 0.008, 0, 1)
      fg[colorIndex + 1] = clamp(fg[colorIndex + 1] * (1 - lineShade * 0.45) + sweepWeight * 0.08, 0, 1)
      fg[colorIndex + 2] = clamp(fg[colorIndex + 2] * (1 - lineShade) + sweepWeight * 0.016, 0, 1)
      bg[colorIndex] = clamp(bg[colorIndex] * (1 - lineShade * 0.15), 0, 1)
      bg[colorIndex + 1] = clamp(bg[colorIndex + 1] * (1 - lineShade * 0.08) + sweepWeight * 0.018, 0, 1)
      bg[colorIndex + 2] = clamp(bg[colorIndex + 2] * (1 - lineShade * 0.15) + sweepWeight * 0.004, 0, 1)
    }
  }
}

function addGlow(bg: Float32Array, width: number, height: number, x: number, y: number, energy: number) {
  if (x < 0 || x >= width || y < 0 || y >= height) return
  addColor(bg, (y * width + x) * 4, energy * 0.03, energy * 0.13, energy * 0.04, energy * 0.28)
}

function applyGlow(buffer: any, strength: number) {
  if (strength <= 0) return

  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex = (y * width + x) * 4
      const alpha = fg[colorIndex + 3]
      if (alpha <= 0) continue

      const red = fg[colorIndex]
      const green = fg[colorIndex + 1]
      const blue = fg[colorIndex + 2]
      const energy = clamp((green - Math.max(red, blue)) * strength, 0, 0.18)
      if (energy < 0.015) continue

      fg[colorIndex + 1] = clamp(green + energy * 0.18, 0, 1)
      fg[colorIndex + 2] = clamp(blue + energy * 0.04, 0, 1)
      addGlow(bg, width, height, x, y, energy)
      addGlow(bg, width, height, x - 1, y, energy * 0.45)
      addGlow(bg, width, height, x + 1, y, energy * 0.45)
      addGlow(bg, width, height, x, y - 1, energy * 0.32)
      addGlow(bg, width, height, x, y + 1, energy * 0.32)
    }
  }
}

function applyPostFx(buffer: any, state: State, profile: RenderProfile) {
  applyGlow(buffer, profile.glow)
  applyScanlines(buffer, state.elapsed, profile.scanline)
}

function paintIntroBackdrop(buffer: any) {
  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const bg = buffer.buffers.bg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number

  for (let y = 0; y < height; y++) {
    const fade = 0.01 + (y / Math.max(1, height - 1)) * 0.025

    for (let x = 0; x < width; x++) {
      const cellIndex = y * width + x
      const colorIndex = cellIndex * 4
      chars[cellIndex] = SPACE
      paintColor(fg, colorIndex, 0.03, 0.14, 0.06, 1)
      paintColor(bg, colorIndex, 0.005, fade, 0.01, 1)
    }
  }
}

function paintText(buffer: any, x: number, y: number, text: string, color: [number, number, number, number]) {
  if (y < 0 || y >= (buffer.height as number)) return

  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number

  for (let index = 0; index < text.length; index++) {
    const px = x + index
    if (px < 0 || px >= width) continue

    const cellIndex = y * width + px
    chars[cellIndex] = text.charCodeAt(index)
    paintColor(fg, cellIndex * 4, color[0], color[1], color[2], color[3])
  }
}

function easeOutCubic(value: number) {
  const progress = clamp(value, 0, 1)
  return 1 - (1 - progress) ** 3
}

function textFxEnabled(api: any, settings: Settings) {
  return settings.enabled && settings.textFall && settings.scope === "all" && currentRouteName(api) === "session"
}

function snapshotChars(state: State, chars: Uint32Array, width: number, height: number, route: string) {
  state.prevChars = Uint32Array.from(chars)
  state.prevWidth = width
  state.prevHeight = height
  state.prevRoute = route
}

function visibleCell(char: number) {
  return char !== EMPTY && char !== SPACE
}

function syncTextDrops(buffer: any, state: State, settings: Settings, api: any) {
  const chars = buffer.buffers.char as Uint32Array
  const width = buffer.width as number
  const height = buffer.height as number
  const route = currentRouteName(api)

  if (!textFxEnabled(api, settings)) {
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

function renderTextDrops(buffer: any, state: State, deltaTime: number) {
  if (!state.textDrops.size) return

  const chars = buffer.buffers.char as Uint32Array
  const fg = buffer.buffers.fg as Float32Array
  const width = buffer.width as number
  const height = buffer.height as number

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
      paintColor(
        fg,
        targetIndex * 4,
        progress > 0.7 ? 0.56 : 0.06,
        progress > 0.7 ? 0.98 : 0.22 + progress * 0.16,
        progress > 0.7 ? 0.6 : 0.08,
        1,
      )
    } else {
      addColor(fg, targetIndex * 4, 0.04, 0.1, 0.04, 0)
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
        paintColor(fg, colorIndex, 0.92, 1, 0.88, 1)
        continue
      }

      const fade = 1 - offset / trail
      paintColor(
        fg,
        colorIndex,
        0.06,
        clamp(0.22 + fade * 0.42, 0, 1),
        clamp(0.08 + fade * 0.22, 0, 1),
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

function paintCenteredLine(
  buffer: any,
  y: number,
  text: string,
  color: [number, number, number, number],
  reveal = 1,
) {
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

function introProgress(state: State, settings: Settings) {
  const duration = introDuration(settings)
  if (!state.introStartedAt || duration <= 0) return 1
  return clamp((Date.now() - state.introStartedAt) / duration, 0, 1)
}

function paintIntroText(buffer: any, state: State, settings: Settings) {
  const width = buffer.width as number
  const height = buffer.height as number
  const progress = introProgress(state, settings)
  const headerY = Math.max(1, Math.floor(height * 0.18))
  const frameY = Math.max(headerY + 3, Math.floor(height * 0.42) - 2)
  const footerY = Math.min(height - 4, frameY + INTRO_FRAME.length + 2)
  const statusY = Math.min(height - 2, footerY + 2)
  const percent = String(Math.round(progress * 100)).padStart(3, "0")

  paintCenteredLine(buffer, headerY, "SECURE CHANNEL // OPENCODE", [0.42, 0.96, 0.54, 1], clamp(progress * 1.5, 0, 1))
  paintCenteredLine(
    buffer,
    headerY + 1,
    "MATRIX RAIN PROTOCOL INITIALIZING",
    [0.18, 0.72, 0.34, 1],
    clamp(progress * 1.6 - 0.08, 0, 1),
  )

  for (let index = 0; index < INTRO_FRAME.length; index++) {
    const line = INTRO_FRAME[index]
    const reveal = clamp(progress * 1.35 - index * 0.05, 0, 1)
    const color: [number, number, number, number] =
      index === 1 ? [0.92, 1, 0.88, 1] : index === 2 ? [0.48, 0.96, 0.58, 1] : [0.18, 0.7, 0.32, 1]
    paintCenteredLine(buffer, frameY + index, line, color, reveal)
  }

  paintCenteredLine(
    buffer,
    footerY,
    `${progressBar(progress, 24)} ${percent}%`,
    [0.48, 0.96, 0.58, 1],
    clamp(progress * 1.8 - 0.2, 0, 1),
  )
  paintCenteredLine(buffer, statusY, introStatus(settings), [0.18, 0.68, 0.32, 1], clamp(progress * 1.8 - 0.32, 0, 1))

  if (width > 68) {
    paintText(buffer, 2, 2, scrambleLine("renderer synchronized", clamp(progress * 1.7, 0, 1)), [0.18, 0.72, 0.34, 1])
    const right = scrambleLine(`scope ${settings.scope} // paint ${settings.paint}`, clamp(progress * 1.7 - 0.05, 0, 1))
    paintText(buffer, width - right.length - 2, 2, right, [0.18, 0.72, 0.34, 1])
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

function introActive(state: State, settings: Settings) {
  return settings.enabled && settings.intro && Date.now() < state.introEndsAt
}

function renderIntro(buffer: any, state: State, settings: Settings, deltaTime: number) {
  const profile = resolveIntroProfile(settings)
  paintIntroBackdrop(buffer)
  renderRain(buffer, state, profile, deltaTime)
  paintIntroText(buffer, state, settings)
  applyPostFx(buffer, state, profile)
}

function routeEnabled(api: any, settings: Settings) {
  return settings.scope === "all" || currentRouteName(api) === "home"
}

async function ensureTheme(api: any) {
  try {
    await api.theme.install(THEME_PATH)
  } catch {}

  if (!api.theme.has(THEME_NAME)) return
  if (api.kv.get(THEME_READY_KEY, false) === true) return

  api.theme.set(THEME_NAME)
  api.kv.set(THEME_READY_KEY, true)
}

function syncLive(api: any, state: State, settings: Settings) {
  const shouldLive = introActive(state, settings) || (settings.enabled && routeEnabled(api, settings))
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
    await ensureTheme(api)

    let settings = readSettings(api)
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
      settings = { ...settings, ...patch }
      persistSettings(api, settings)

      if (!settings.enabled || !settings.intro) {
        state.introStartedAt = 0
        state.introEndsAt = 0
      }

      if (!settings.enabled || !settings.textFall || settings.scope !== "all") {
        resetTextFx(state)
      }

      if (patch.density || patch.speed || patch.profile) {
        resetScene(state)
      }

      requestRefresh()
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
          onSelect(option) {
            option.onSelect?.()
          },
        }),
      )
    }

    const showSettings = () => {
      const options = [
        {
          title: `Effect: ${settings.enabled ? "On" : "Off"}`,
          value: "effect",
          description: "Toggle the Matrix rain overlay.",
          onSelect: () => {
            updateSettings({ enabled: !settings.enabled })
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
        api.theme.selected !== THEME_NAME
          ? {
              title: "Use matrix-console theme",
              value: "theme",
              description: "Switch the UI to the Matrix theme.",
              onSelect: () => {
                if (!api.theme.has(THEME_NAME)) return
                api.theme.set(THEME_NAME)
                api.renderer.requestRender()
                api.ui.toast({
                  variant: "success",
                  message: "Switched to matrix-console",
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

      openMenu("Matrix rain settings", options)
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
            description: "Return to Matrix rain settings.",
            onSelect: () => showSettings(),
          },
        ],
        current,
        "medium",
      )
    }

    const post = (buffer: any, deltaTime: number) => {
      if (!syncLive(api, state, settings)) {
        return
      }

      state.elapsed += clamp(deltaTime / 1000, 0.016, 0.11)

      if (introActive(state, settings)) {
        renderIntro(buffer, state, settings, deltaTime)
        return
      }

      syncTextDrops(buffer, state, settings, api)

      const profile = resolveRenderProfile(api, settings)
      renderRain(buffer, state, profile, deltaTime)
      renderTextDrops(buffer, state, deltaTime)
      applyPostFx(buffer, state, profile)
    }

    startIntro(state, settings)

    api.command.register(() => [
      {
        title: "Matrix rain settings",
        value: "plugin.matrix-rain.settings",
        category: "Plugin",
        onSelect: () => showSettings(),
      },
      {
        title: settings.enabled ? "Disable Matrix rain" : "Enable Matrix rain",
        value: "plugin.matrix-rain.toggle",
        category: "Plugin",
        onSelect: () => {
          const nextEnabled = !settings.enabled
          updateSettings({ enabled: nextEnabled })
          api.ui.toast({
            variant: "info",
            message: nextEnabled
              ? `Matrix rain enabled ${settings.scope === "all" ? "everywhere" : "on the home screen"}`
              : "Matrix rain disabled",
          })
        },
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
        hidden: api.theme.selected === THEME_NAME,
        onSelect: () => {
          if (!api.theme.has(THEME_NAME)) return
          api.theme.set(THEME_NAME)
          api.renderer.requestRender()
          api.ui.toast({
            variant: "success",
            message: "Switched to matrix-console",
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
