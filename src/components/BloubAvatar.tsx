import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { BloubSampler, getBloubConfig } from '../lib/bloubEngine';

interface BloubAvatarProps {
  seed: string;
  hue?: number | null;
  shape?: string | null;
  size?: number | string;
  className?: string;
  animated?: boolean;
  animationOffset?: number;
}

const CYCLE_STATES = ['idle', 'wink', 'idle', 'wide', 'idle'];
const CYCLE_DURATIONS = [3.0, 1.6, 3.0, 1.8, 3.0];

let globalPointer: { x: number; y: number } | null = null;
let pointerListenersAttached = false;

function ensurePointerListener() {
  if (pointerListenersAttached || typeof window === 'undefined') return;
  pointerListenersAttached = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'touch') {
        globalPointer = { x: e.clientX, y: e.clientY };
      }
    },
    { passive: true }
  );
}

export const BloubAvatar: React.FC<BloubAvatarProps> = ({
  seed,
  hue = null,
  shape = null,
  size = '100%',
  className = '',
  animated = true,
  animationOffset = 0,
}) => {
  const rawId = useId().replace(/:/g, '');
  const maskId = `bloub-mask-${rawId}`;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const config = useMemo(() => getBloubConfig(seed, hue, shape), [seed, hue, shape]);
  const sampler = useMemo(
    () => new BloubSampler(100, 'idle', config.radii, config.expression),
    [config]
  );

  const [frame, setFrame] = useState(() => sampler.sample(animationOffset));

  useEffect(() => {
    if (!animated) {
      setFrame(sampler.sample(animationOffset));
      return;
    }
    ensurePointerListener();
    let rafId = 0;
    const startMs = performance.now();
    let lastCycleIdx = 0;

    const tick = (nowMs: number) => {
      const elapsed = (nowMs - startMs) / 1000 + animationOffset;
      const totalCycle = 12.4;
      const mod = ((elapsed % totalCycle) + totalCycle) % totalCycle;
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < CYCLE_DURATIONS.length; i++) {
        if (mod < acc + CYCLE_DURATIONS[i]) {
          idx = i;
          break;
        }
        acc += CYCLE_DURATIONS[i];
      }
      if (idx !== lastCycleIdx) {
        lastCycleIdx = idx;
        sampler.setState(CYCLE_STATES[idx], elapsed);
      }

      if (globalPointer && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const dx = Math.max(-1, Math.min(1, (globalPointer.x - (rect.left + rect.width / 2)) / 320));
          const dy = Math.max(-1, Math.min(1, (globalPointer.y - (rect.top + rect.height / 2)) / 320));
          sampler.setLook(
            {
              yaw: dx * 22,
              pitch: 10 - dy * 15,
              mix: 0.75,
              spin: 0,
              wander: 0.25,
            },
            elapsed,
            0.18
          );
        }
      }

      setFrame(sampler.sample(elapsed));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [animated, animationOffset, sampler]);

  return (
    <svg
      ref={svgRef}
      viewBox="-158 -158 316 316"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-158} y={-158} width={316} height={316}>
          <path fill="#fff" d={frame.bodyPath} />
          {frame.eyes.map((eye, idx) => (
            <path
              key={idx}
              fill="#000"
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
            />
          ))}
        </mask>
      </defs>
      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill="#f9f9f9" />
        <g mask={`url(#${maskId})`}>
          <rect x={-158} y={-158} width={316} height={316} fill={config.colorHex} />
        </g>
      </g>
    </svg>
  );
};

interface MountedAvatarInstance {
  sampler: BloubSampler;
  maskBody: SVGPathElement;
  paperPath: SVGPathElement;
  eyePaths: SVGPathElement[];
  svgEl: SVGSVGElement;
  offset: number;
  lastStateIdx: number;
  interactiveLook: boolean;
}

let domMaskSeq = 0;

export function mountDomBloubAvatar(
  container: HTMLElement,
  opts: {
    seed: string;
    hue?: number | null;
    shape?: string | null;
    className?: string;
    offset?: number;
    interactiveLook?: boolean;
  }
): MountedAvatarInstance {
  const config = getBloubConfig(opts.seed, opts.hue ?? null, opts.shape ?? null);
  const sampler = new BloubSampler(100, 'idle', config.radii, config.expression);
  const offset = opts.offset ?? 0;
  const frame = sampler.sample(offset);
  const maskId = `dom-bloub-mask-${++domMaskSeq}`;
  const ns = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '-158 -158 316 316');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (opts.className) {
    svg.setAttribute('class', opts.className);
  }

  const defs = document.createElementNS(ns, 'defs');
  const mask = document.createElementNS(ns, 'mask');
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '-158');
  mask.setAttribute('y', '-158');
  mask.setAttribute('width', '316');
  mask.setAttribute('height', '316');

  const maskBody = document.createElementNS(ns, 'path');
  maskBody.setAttribute('fill', '#fff');
  maskBody.setAttribute('d', frame.bodyPath);
  mask.appendChild(maskBody);

  const eyePaths: SVGPathElement[] = [];
  for (let i = 0; i < 2; i++) {
    const ep = document.createElementNS(ns, 'path');
    ep.setAttribute('fill', '#000');
    const eye = frame.eyes[i];
    if (eye) {
      ep.setAttribute('d', eye.d);
      ep.setAttribute('transform', eye.matrix);
      ep.setAttribute('opacity', String(eye.alpha));
    } else {
      ep.setAttribute('opacity', '0');
    }
    mask.appendChild(ep);
    eyePaths.push(ep);
  }
  defs.appendChild(mask);
  svg.appendChild(defs);

  const gBody = document.createElementNS(ns, 'g');
  const paperPath = document.createElementNS(ns, 'path');
  paperPath.setAttribute('d', frame.bodyPath);
  paperPath.setAttribute('fill', '#f9f9f9');
  gBody.appendChild(paperPath);

  const maskedGroup = document.createElementNS(ns, 'g');
  maskedGroup.setAttribute('mask', `url(#${maskId})`);
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', '-158');
  rect.setAttribute('y', '-158');
  rect.setAttribute('width', '316');
  rect.setAttribute('height', '316');
  rect.setAttribute('fill', config.colorHex);
  maskedGroup.appendChild(rect);
  gBody.appendChild(maskedGroup);
  svg.appendChild(gBody);

  container.innerHTML = '';
  container.appendChild(svg);

  return {
    sampler,
    maskBody,
    paperPath,
    eyePaths,
    svgEl: svg,
    offset,
    lastStateIdx: 0,
    interactiveLook: opts.interactiveLook ?? false,
  };
}

export function stepMountedBloubAvatar(instance: MountedAvatarInstance, elapsedSec: number, isHovered = false) {
  const t = elapsedSec + instance.offset;
  const totalCycle = 12.4;
  const mod = ((t % totalCycle) + totalCycle) % totalCycle;
  let acc = 0;
  let idx = 0;
  for (let i = 0; i < CYCLE_DURATIONS.length; i++) {
    if (mod < acc + CYCLE_DURATIONS[i]) {
      idx = i;
      break;
    }
    acc += CYCLE_DURATIONS[i];
  }
  if (idx !== instance.lastStateIdx) {
    instance.lastStateIdx = idx;
    instance.sampler.setState(CYCLE_STATES[idx], t);
  }

  if ((isHovered || instance.interactiveLook) && globalPointer) {
    const rect = instance.svgEl.getBoundingClientRect();
    if (rect.width > 0) {
      const dx = Math.max(-1, Math.min(1, (globalPointer.x - (rect.left + rect.width / 2)) / 260));
      const dy = Math.max(-1, Math.min(1, (globalPointer.y - (rect.top + rect.height / 2)) / 260));
      instance.sampler.setLook(
        {
          yaw: dx * 24,
          pitch: 10 - dy * 16,
          mix: 0.85,
          spin: 0,
          wander: 0.15,
        },
        t,
        0.18
      );
    }
  } else {
    instance.sampler.setLook(null, t, 0.35);
  }

  const frame = instance.sampler.sample(t);
  instance.maskBody.setAttribute('d', frame.bodyPath);
  instance.paperPath.setAttribute('d', frame.bodyPath);
  for (let i = 0; i < 2; i++) {
    const eye = frame.eyes[i];
    const ep = instance.eyePaths[i];
    if (eye) {
      ep.setAttribute('d', eye.d);
      ep.setAttribute('transform', eye.matrix);
      ep.setAttribute('opacity', String(eye.alpha));
    } else {
      ep.setAttribute('opacity', '0');
    }
  }
}
