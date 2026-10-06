export const darkgrayColor = "#252837";
export const whiteColor = "#fff";
export const blackColor = "black";
export const grayColor = "#96989aff";
export const primaryRedColor = "#E94545";
export const redColor = "#E94545";
export const inputBgColor = "#F2F2F7";
export const tabBgColor = "#F3F4F6";
export const borderLightColor = "#E5E5EA";
export const purpleColor = "#9B51E0";
export const screenBgColor = "#F0F2F5";
export const goldColor = "#FFA928";
export const lightGrayColor = "#D1D4D6";
export const lightGreenColor = "#42f5a4";
export const lightGrayOpacityColor = "#e8e8e0";
export const brightTurquoiseColor = "#34ebc0";
export const blackOpacity5 = 'rgba(0,0,0,0.5)';
export const lightShadeBlue = "#bbc1d6";
export const verylightGrayColor = "#E6E6E6";
export const mediumGray = "#808080";
export const lightPink = "#FFEBEB";
export const blackOpacity7 = 'rgba(0,0,0,0.7)';
export const greenColor = "#3B8000";

export const splashBgColor = '#03050d';
export const authCardBg = '#1A1D2B';
export const authInputBg = '#0d1126';
export const authBorderColor = 'rgba(139,92,246,0.25)';
export const authMutedColor = '#8A90AA';
export const authLinkColor = '#5B9BD5';
export const authTabBg = '#1E2130';
export const authSocialBg = '#1E2130';
export const authStatCardBg = 'rgba(255,255,255,0.06)';



export const orangeColor = '#FF5733';
export const lightOrangeColor = '#EF502E';
export const ExtraExtralightOrangeColor = '#FFF4F1';
export const blueColor = '#3B6981';
export const lightBlueColor ='#3b698143';

// ---------------------------------------------------------------------------
// Driver app — light theme
// ---------------------------------------------------------------------------
// A cab in daylight is the hardest place to read a screen, so the app is light
// with strong contrast and one accent. The dark auth tokens above are left
// alone: they belong to another flow and removing them would break it.
//
// The accent is the red already in this file. Everything else is a neutral
// with a faint warm tint so it reads as chosen rather than as default grey.

// Grounds. `appBg` is the page, `cardBg` the raised surface on top of it.
export const appBg = '#03050d';
export const cardBg = '#0a0d1c';
export const cardBgSoft = '#0d1126';

// Lines. `borderColor` for dividers, `borderStrong` for input outlines that
// have to be findable in sunlight.
export const borderColor = 'rgba(139,92,246,0.18)';
/*
 * The unfilled part of a progress ring.
 *
 * Darker than borderColor on purpose. At border grey on a white card the used
 * portion was almost invisible, so a ring read as a black arc floating in
 * space rather than as a proportion of something — which is the one thing a
 * ring is for.
 */
export const ringTrack = '#2a2f52';
export const borderStrong = '#2d3358';

// Text. Four steps is enough; a fifth one is always too close to its neighbour.
export const textDark = '#E8ECF8';
export const textBody = '#C5CBE0';
export const textMuted = '#8A90AA';
export const textFaint = '#5F6585';

// The accent, and the two tints it needs to sit on.
export const accentColor = '#8b5cf6';
export const accentPressed = '#7c4de0';
export const accentSoft = 'rgba(139,92,246,0.16)';
export const accentLine = 'rgba(139,92,246,0.4)';

// On a filled accent button. Near-white rather than pure, which stops the red
// vibrating against it.
export const onAccent = '#FFFFFF';

// Duty statuses. These are the four bands on the log graph and the four big
// buttons, so they have to be told apart at a glance and while moving.
export const dutyOffColor = '#8A93A3';
export const dutySleeperColor = '#5B6BC9';
export const dutyDrivingColor = '#1F9254';
export const dutyOnDutyColor = '#D98324';

// State, kept separate from the accent — "danger" must never read as "the
// button you press".
export const okColor = '#34d399';
export const okSoft = 'rgba(52,211,153,0.14)';
export const warnColor = '#fbbf24';
export const warnSoft = 'rgba(251,191,36,0.14)';
export const dangerColor = '#f87171';
export const dangerSoft = 'rgba(239,68,68,0.14)';

// A control that is not pressable yet. Reads as "not yet", not as broken.
export const disabledBg = '#171b33';
export const disabledText = '#5F6585';

// Onboarding progress.
export const dotActiveColor = '#8b5cf6';
export const dotInactiveColor = '#3a3f66';

// Shadow, used through elevation on Android and shadowColor on iOS.
export const shadowColor = '#000000';

// Placeholder inside an input. Muted is too dark next to typed text.
export const placeholderColor = '#5F6585';

// A focused field lifts off the card; an errored one takes the faintest wash
// of the danger colour. Both were inline hex in CustomTextInput.
export const inputFocusBg = '#0f1326';
export const inputErrorBg = '#1a0f18';

// ---------------------------------------------------------------------------
// Translucent washes
// ---------------------------------------------------------------------------
// Alpha values, so they sit over whatever is behind them. They were written
// inline as rgba() in six files, which is the one thing the house style bans:
// a theme change had six places to find and nobody would find all six.
export const brandWashFaint = 'rgba(139,92,246,0.08)';
export const brandWashSoft = 'rgba(139,92,246,0.12)';
export const brandWashMid = 'rgba(139,92,246,0.2)';
export const brandWashStrong = 'rgba(139,92,246,0.28)';
export const brandWashDeep = 'rgba(139,92,246,0.4)';

/** On a dark ground: a splash panel, a pressed tile. */
export const lightWash = 'rgba(255,255,255,0.12)';
/** The wash over a selected duty tile, which already carries its own colour. */
export const selectedWash = 'rgba(255,255,255,0.2)';
export const splashText = 'rgba(255,247,247,0.62)';
/** Behind a modal. Cool rather than black, so the card below reads as lifted. */
export const scrim = 'rgba(2,3,10,0.78)';

// ---------------------------------------------------------------------------
// Neural theme — the dark violet/cyan look of the desktop web app
// ---------------------------------------------------------------------------
// Values taken from the web app's own stylesheet (aime.base2brand.com) so the
// mobile app and the desktop app read as one product.
export const neuralBg = '#03050d';
export const neuralBgRaised = '#070a18';
export const neuralPanel = '#0a0d1c';
export const neuralViolet = '#8b5cf6';
export const neuralCyan = '#06b6d4';
export const neuralBlue = '#38bdf8';
export const neuralMagenta = '#d946ef';
export const neuralAmber = '#f59e0b';
export const neuralTeal = '#2dd4bf';
export const neuralBorder = 'rgba(139,92,246,0.35)';
export const neuralBorderSoft = 'rgba(139,92,246,0.18)';
export const neuralText = '#E8ECF8';
export const neuralTextMuted = '#8A90AA';
