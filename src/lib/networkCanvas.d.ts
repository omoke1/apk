export interface LandingNetworkOptions {
  stageEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  marksEl: HTMLElement;
  headingEl: HTMLElement;
  onPlayingChange?: (playing: boolean) => void;
}

export function mountLandingNetwork(options: LandingNetworkOptions): () => void;
