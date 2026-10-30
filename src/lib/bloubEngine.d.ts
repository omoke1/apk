export interface BloubEyeFrame {
  d: string;
  matrix: string;
  alpha: number;
}

export interface BloubDotFrame {
  x: number;
  y: number;
  r: number;
  d?: string;
  rot?: number;
  opacity: number;
  color?: string;
  depth?: number;
}

export interface BloubArcFrame {
  id: string;
  front: string;
  back: string;
  width: number;
  opacity: number;
  grad: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stops: string[];
  };
}

export interface BloubSampleFrame {
  bodyPath: string;
  bodyAlpha: number;
  eyes: BloubEyeFrame[];
  dots: BloubDotFrame[];
  dotsBehind: boolean;
  arcs: BloubArcFrame[];
  notif: { x: number; y: number; r: number } | null;
  notch: { x: number; y: number; r: number } | null;
}

export class BloubSampler {
  constructor(
    scale?: number,
    state?: string,
    shapeRadii?: number[] | null,
    expression?: unknown
  );
  setState(state: string, time: number, phase?: number): void;
  setLook(
    look: { yaw: number; pitch: number; mix: number; spin: number; wander: number } | null,
    time: number,
    morphDuration?: number
  ): void;
  sample(time: number): BloubSampleFrame;
}

export function createStaticAvatarSvg(
  seed: string,
  hue?: number | null,
  shapeOverride?: string | null
): SVGSVGElement;

export function getBloubConfig(
  seed: string,
  hue?: number | null,
  shapeOverride?: string | null
): {
  shapeId: string;
  radii: number[] | null;
  colorHex: string;
  expression: unknown;
  profile: { shape: string; expression: string; color: string };
};

export function bloubAvatarProfile(
  seed: string,
  hue: number | null
): { shape: string; expression: string; color: string };

export function avatarHeadColor(seed: string, hue: number | null): string;

export const AVATAR_HUE_CHOICES: Array<{ hue: number; label: string }>;
export const AVATAR_HUE_OPTIONS: Array<{ hue: number; label: string }>;
