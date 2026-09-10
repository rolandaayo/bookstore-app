// ─── BookStore dark-first design tokens ───────────────────────────────────────

// Brand
export const primary = "#7C6FF7"; // soft indigo-violet
export const primaryDark = "#5B52CC";
export const primaryLight = "#2D2860"; // muted indigo bg for chips / badges

// Semantic
export const accent = "#F5A623"; // warm amber  — price / CTA highlights
export const success = "#34D399";
export const error = "#F87171";
export const warning = "#FBBF24";

// Dark surface stack  (darkest → lightest)
export const bg0 = "#080B14"; // page background
export const bg1 = "#0F1423"; // card
export const bg2 = "#161D30"; // elevated card / modal sheet
export const bg3 = "#1E2740"; // input / chip surface

export const border = "#252E45";
export const divider = "#1A2235";

// Text
export const textPrimary = "#F0F2FF";
export const textSecondary = "#8A94AF";
export const textMuted = "#505A73";
export const placeholder = "#505A73";

// Tab bar
export const tabActive = primary;
export const tabInactive = "#3D4664";

// ─── Backward-compat shape used by older components ────────────────────────────
export const Colors = {
  primary,
  primaryDark,
  primaryLight,
  accent,
  success,
  error,
  warning,

  // We force dark everywhere — the "light" key mirrors dark so nothing breaks
  // if a component still reads Colors.light.*
  light: {
    text: textPrimary,
    subtext: textSecondary,
    background: bg0,
    card: bg1,
    border,
    tint: primary,
    icon: textSecondary,
    tabIconDefault: tabInactive,
    tabIconSelected: tabActive,
    placeholder,
  },
  dark: {
    text: textPrimary,
    subtext: textSecondary,
    background: bg0,
    card: bg1,
    border,
    tint: primary,
    icon: textSecondary,
    tabIconDefault: tabInactive,
    tabIconSelected: tabActive,
    placeholder,
  },
};
