export interface LandingBeamOptions {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  surface: () => HTMLElement | null | undefined;
  source?: () => HTMLElement | null | undefined;
  avoid?: () => HTMLElement[];
  beamPosition: number;
  color: string;
  tint?: () => string | undefined;
  pace?: () => number;
  start?: Promise<void>;
  onImpact?: () => void;
}

export function mountLandingBeam(options: LandingBeamOptions): () => void;
