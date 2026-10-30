/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  DOWNLOAD_HTML,
  FAQ_HTML,
  FEATURES_HTML,
  FOOTER_HTML,
  HEADER_HTML,
  HERO_COPY_HTML,
  NETWORK_MARKS_HTML,
  POST_CTA_HTML,
  PRICING_HTML,
  TEAMS_HTML,
} from './lib/landingHtmlSections';
import { mountLandingBeam } from './lib/beamEffect';
import { mountLandingNetwork } from './lib/networkCanvas';
import { mountDomBloubAvatar, stepMountedBloubAvatar } from './components/BloubAvatar';
import { OpenBotAppPreview } from './components/OpenBotAppPreview';

type PlatformKey = 'windows' | 'macos' | 'linux' | 'ios' | 'android';

const PLATFORM_INFO: Record<
  PlatformKey,
  {
    label: string;
    action: string;
    status: string;
    requirements: string;
    steps: string[];
    svgViewBox: string;
    svgPath: string;
  }
> = {
  windows: {
    label: 'Windows',
    action: 'Download for Windows',
    status: 'AVAILABLE',
    requirements: 'Windows 10 or later (64-bit x64) · 4 GB RAM · 400 MB free disk space',
    steps: [
      'Download OpenBot-Setup-0.54.0-x64.exe.',
      'Run the installer—no administrator privileges required.',
      'Launch OpenBot and sign in with your existing Claude, ChatGPT, Gemini, or Grok plan.',
    ],
    svgViewBox: '0 0 448 512',
    svgPath:
      'M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z',
  },
  macos: {
    label: 'macOS',
    action: 'Download for macOS',
    status: 'AVAILABLE',
    requirements: 'macOS 13 Ventura or later · Apple silicon (M1–M4) or Intel',
    steps: [
      'Download OpenBot-0.54.0-arm64.dmg (or x64 for Intel Macs).',
      'Open the disk image and drag OpenBot to your Applications folder.',
      'Open OpenBot and connect your preferred AI provider or local Ollama model.',
    ],
    svgViewBox: '0 0 24 24',
    svgPath:
      'M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.978 4.45z',
  },
  linux: {
    label: 'Linux',
    action: 'Download for Linux',
    status: 'AVAILABLE',
    requirements: 'Ubuntu 22.04+, Fedora 39+, Arch, or Debian 12+ (x64 / arm64 AppImage)',
    steps: [
      'Download OpenBot-0.54.0-x86_64.AppImage.',
      'Mark it executable: chmod +x OpenBot-0.54.0-x86_64.AppImage.',
      'Run the AppImage directly—all workspaces and SQLite storage stay in ~/.local/share/OpenBot.',
    ],
    svgViewBox: '0 0 448 512',
    svgPath:
      'M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7z',
  },
  ios: {
    label: 'iPhone',
    action: 'Download on the App Store',
    status: 'APP STORE',
    requirements: 'iOS 17.0 or later · Pairs with OpenBot running on your computer',
    steps: [
      'Install OpenBot from the iOS App Store.',
      'Open the desktop app on your computer and go to Settings → Pair Phone.',
      'Scan the QR code to message and steer your agents from anywhere.',
    ],
    svgViewBox: '0 0 24 24',
    svgPath:
      'M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.978 4.45z',
  },
  android: {
    label: 'Android',
    action: 'Get it on Google Play',
    status: 'GOOGLE PLAY',
    requirements: 'Android 11 or later · Pairs with OpenBot running on your computer',
    steps: [
      'Install OpenBot from Google Play.',
      'Open the desktop app on your computer and go to Settings → Pair Phone.',
      'Scan the QR code to talk to your agents from your phone.',
    ],
    svgViewBox: '0 0 576 512',
    svgPath:
      'M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55',
  },
};

const GLOW_STOPS = [
  { offset: 0, color: 'var(--openbot-logo-production)', opacity: 1 },
  { offset: 0.22, color: 'var(--openbot-logo-production)', opacity: 1 },
  { offset: 0.42, color: 'var(--openbot-logo-dev)', opacity: 1 },
  { offset: 0.62, color: 'var(--openbot-logo-preview)', opacity: 1 },
  { offset: 0.82, color: 'var(--openbot-logo-production)', opacity: 1 },
  { offset: 1, color: 'var(--openbot-logo-production)', opacity: 0 },
];

const GLOW_HEIGHTS = Array.from({ length: 9 }, (_, idx) => {
  const n = 1 - Math.pow(Math.abs(idx - 4) / 4, 1.24);
  return 0.98 * 599 * (0.55 + 0.45 * n);
});

export default function App() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const beamContainerRef = useRef<HTMLDivElement | null>(null);
  const beamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroCopyWrapperRef = useRef<HTMLDivElement | null>(null);
  const previewSectionRef = useRef<HTMLElement | null>(null);

  const networkSectionRef = useRef<HTMLElement | null>(null);
  const networkStageRef = useRef<HTMLDivElement | null>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const networkHeadingRef = useRef<HTMLElement | null>(null);
  const networkMarksRef = useRef<HTMLDivElement | null>(null);
  const [networkPlaying, setNetworkPlaying] = useState(false);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const [glowScale, setGlowScale] = useState(0);

  // Interactive modals state
  const [downloadModalPlatform, setDownloadModalPlatform] = useState<PlatformKey | null>(null);
  const [compareModalSlug, setCompareModalSlug] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // 1. Mount WebGL2 Volumetric Beam Shader in Hero
  useEffect(() => {
    const container = beamContainerRef.current;
    const canvas = beamCanvasRef.current;
    if (!container || !canvas) return;

    const cleanup = mountLandingBeam({
      container,
      canvas,
      surface: () => previewSectionRef.current,
      source: () =>
        pageRef.current?.querySelector<HTMLElement>('.site-header-actions .landing-button-primary'),
      avoid: () => {
        const copyEl = heroCopyWrapperRef.current?.querySelector('.landing-hero-copy');
        return copyEl ? (Array.from(copyEl.children) as HTMLElement[]) : [];
      },
      beamPosition: 0.78,
      color: '#a46cf5',
    });

    return cleanup;
  }, []);

  // 2. Mount Interactive Agent Network Canvas ("Your agents talk to each other.")
  useEffect(() => {
    const stageEl = networkStageRef.current;
    const canvasEl = networkCanvasRef.current;
    const marksEl = networkMarksRef.current;
    const headingEl = networkHeadingRef.current;
    if (!stageEl || !canvasEl || !marksEl || !headingEl) return;

    const cleanup = mountLandingNetwork({
      stageEl,
      canvasEl,
      marksEl,
      headingEl,
      onPlayingChange: (playing) => setNetworkPlaying(playing),
    });

    return cleanup;
  }, []);

  // 3. Hydrate static SSR sections: Reveal Observer, Bloub Avatars in Features & Honeycomb, Header Nav, Hero Download Selector, Teams Sticky Stack, and Link Interception
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    // A. Reveal animations via IntersectionObserver
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>('[data-revealed]'));
    // Immediately reveal above-the-fold or observe
    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute('data-revealed', 'true');
          }
        }
      },
      { rootMargin: '120px 0px', threshold: 0.05 }
    );
    revealEls.forEach((el) => {
      el.setAttribute('data-revealed', 'true');
      revealObs.observe(el);
    });

    // B. Hero Download Selector: default to "Download for Windows" (matching video at 00:00) and attach interactive dropdown menu
    let selectedPlatform: PlatformKey = 'windows';
    let menuOpen = false;
    const selectorEl = root.querySelector<HTMLElement>('.landing-download-selector');
    const primaryBtn = selectorEl?.querySelector<HTMLAnchorElement>('.landing-download-primary');
    const triggerBtn = selectorEl?.querySelector<HTMLButtonElement>('.landing-download-trigger');
    let menuEl: HTMLDivElement | null = null;

    const renderPrimaryPlatform = (plat: PlatformKey) => {
      if (!primaryBtn || !selectorEl) return;
      const info = PLATFORM_INFO[plat];
      selectorEl.setAttribute('data-detected-platform', plat);
      primaryBtn.setAttribute('href', `#download-${plat}`);
      primaryBtn.innerHTML = `<svg viewBox="${info.svgViewBox}" fill="currentColor" aria-hidden="true" data-platform="${plat}"><path d="${info.svgPath}"></path></svg>${info.action}`;
    };

    const closeDownloadMenu = () => {
      if (!selectorEl || !triggerBtn) return;
      menuOpen = false;
      selectorEl.setAttribute('data-open', 'false');
      triggerBtn.setAttribute('aria-expanded', 'false');
      if (menuEl && menuEl.parentNode) {
        menuEl.parentNode.removeChild(menuEl);
        menuEl = null;
      }
    };

    const openDownloadMenu = () => {
      if (!selectorEl || !triggerBtn) return;
      menuOpen = true;
      selectorEl.setAttribute('data-open', 'true');
      triggerBtn.setAttribute('aria-expanded', 'true');
      if (menuEl) menuEl.remove();

      menuEl = document.createElement('div');
      menuEl.className = 'landing-download-menu';
      menuEl.setAttribute('role', 'menu');
      menuEl.setAttribute('aria-label', 'Download platforms');

      const makeItem = (plat: PlatformKey) => {
        const info = PLATFORM_INFO[plat];
        const a = document.createElement('a');
        a.className = 'landing-download-menu-item';
        a.setAttribute('role', 'menuitem');
        a.setAttribute('data-state', 'available');
        a.setAttribute('href', `#download-${plat}`);
        if (plat === selectedPlatform) {
          a.setAttribute('data-selected', 'true');
        }
        a.innerHTML = `<svg viewBox="${info.svgViewBox}" fill="currentColor" aria-hidden="true" data-platform="${plat}"><path d="${info.svgPath}"></path></svg><span>${info.label}</span><small>${info.status}</small>`;
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          selectedPlatform = plat;
          renderPrimaryPlatform(plat);
          closeDownloadMenu();
          setDownloadModalPlatform(plat);
        });
        return a;
      };

      (['macos', 'windows', 'linux'] as PlatformKey[]).forEach((p) => {
        menuEl!.appendChild(makeItem(p));
      });

      const hr = document.createElement('hr');
      hr.className = 'landing-download-menu-separator';
      menuEl.appendChild(hr);

      const label = document.createElement('span');
      label.className = 'landing-download-menu-label';
      label.textContent = 'Phone apps';
      menuEl.appendChild(label);

      (['ios', 'android'] as PlatformKey[]).forEach((p) => {
        menuEl!.appendChild(makeItem(p));
      });

      selectorEl.appendChild(menuEl);
    };

    renderPrimaryPlatform('windows');

    const onTriggerClick = (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (menuOpen) closeDownloadMenu();
      else openDownloadMenu();
    };
    triggerBtn?.addEventListener('click', onTriggerClick);

    const onDocPointerDown = (ev: PointerEvent) => {
      if (menuOpen && selectorEl && !selectorEl.contains(ev.target as Node)) {
        closeDownloadMenu();
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);

    // C. Header Navigation Dropdowns
    const siteNav = root.querySelector<HTMLElement>('.site-nav');
    const navPill = siteNav?.querySelector<HTMLElement>('.site-nav-pill');
    const navSurface = siteNav?.querySelector<HTMLElement>('.site-nav-surface');
    const navItems = Array.from(siteNav?.querySelectorAll<HTMLLIElement>('.site-nav-item') ?? []);
    let closeNavTimeout = 0;

    const openNavItem = (item: HTMLLIElement) => {
      window.clearTimeout(closeNavTimeout);
      const trigger = item.querySelector<HTMLElement>('.site-nav-trigger');
      const panel = item.querySelector<HTMLElement>('.site-nav-panel');
      if (!siteNav || !trigger) return;

      const trackRect = siteNav.querySelector('.site-nav-track')?.getBoundingClientRect();
      const trigRect = trigger.getBoundingClientRect();
      if (navPill && trackRect) {
        navPill.setAttribute('data-shown', '');
        navPill.style.setProperty('--site-nav-pill-x', `${trigRect.left - trackRect.left - 4}px`);
        navPill.style.setProperty('--site-nav-pill-width', `${trigRect.width}px`);
      }

      navItems.forEach((other) => {
        const t = other.querySelector<HTMLElement>('.site-nav-trigger');
        const p = other.querySelector<HTMLElement>('.site-nav-panel');
        if (other === item && p) {
          t?.setAttribute('aria-expanded', 'true');
          p.setAttribute('data-state', 'open');
          p.removeAttribute('inert');
        } else {
          t?.setAttribute('aria-expanded', 'false');
          p?.setAttribute('data-state', 'closed');
          p?.setAttribute('inert', '');
        }
      });

      if (panel && navSurface) {
        siteNav.setAttribute('data-state', 'open');
        const panelInner = panel.firstElementChild as HTMLElement | null;
        if (panelInner) {
          const w = panelInner.offsetWidth || 540;
          const h = panelInner.offsetHeight || 320;
          navSurface.style.setProperty('--site-nav-surface-width', `${w}px`);
          navSurface.style.setProperty('--site-nav-surface-height', `${h}px`);
          navSurface.style.setProperty('--site-nav-surface-x', `${panel.offsetLeft}px`);
        }
      } else {
        siteNav.setAttribute('data-state', 'closed');
      }
    };

    const scheduleCloseNav = () => {
      window.clearTimeout(closeNavTimeout);
      closeNavTimeout = window.setTimeout(() => {
        if (!siteNav) return;
        siteNav.setAttribute('data-state', 'closed');
        navPill?.removeAttribute('data-shown');
        navItems.forEach((item) => {
          item.querySelector('.site-nav-trigger')?.setAttribute('aria-expanded', 'false');
          const p = item.querySelector('.site-nav-panel');
          p?.setAttribute('data-state', 'closed');
          p?.setAttribute('inert', '');
        });
      }, 150);
    };

    navItems.forEach((item) => {
      item.addEventListener('pointerenter', () => openNavItem(item));
      item.addEventListener('pointerleave', scheduleCloseNav);
    });

    // Mobile menu button toggle
    const menuBtn = root.querySelector<HTMLButtonElement>('.site-menu-button');
    const sheetEl = root.querySelector<HTMLElement>('.site-sheet');
    const onMenuBtnClick = () => {
      if (!menuBtn || !sheetEl) return;
      const isOpen = sheetEl.getAttribute('data-state') === 'open';
      if (isOpen) {
        sheetEl.setAttribute('data-state', 'closed');
        sheetEl.setAttribute('inert', '');
        menuBtn.setAttribute('aria-expanded', 'false');
      } else {
        sheetEl.setAttribute('data-state', 'open');
        sheetEl.removeAttribute('inert');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    };
    menuBtn?.addEventListener('click', onMenuBtnClick);

    // D. Mount Bloub Avatars in "What OpenBot does" (Features) & "Meet your first teammate" (Honeycomb)
    const mountedAvatars: Array<{
      instance: ReturnType<typeof mountDomBloubAvatar>;
      cellIndex: number | null;
    }> = [];
    let hoveredHoneycombIndex: number | null = null;

    // 1) Features Bento Grid avatars:
    // Top bar small stack: Ada (245), Linus (150), Grace (30)
    const smallStackAvatars = Array.from(
      root.querySelectorAll<HTMLElement>('.landing-team-stack .landing-team-avatar-small')
    );
    const teamSpecs = [
      { seed: 'landing-ada', hue: 245 },
      { seed: 'landing-linus', hue: 150 },
      { seed: 'landing-grace', hue: 30 },
    ];
    smallStackAvatars.forEach((el, idx) => {
      const spec = teamSpecs[idx % teamSpecs.length];
      mountedAvatars.push({
        instance: mountDomBloubAvatar(el, {
          seed: spec.seed,
          hue: spec.hue,
          offset: idx * 1.7,
        }),
        cellIndex: null,
      });
    });

    // Large message avatars in #launch: Ada, Linus, Grace, Ada
    const largeTeamAvatars = Array.from(
      root.querySelectorAll<HTMLElement>('.landing-team .landing-team-avatar-large')
    );
    const messageSpecs = [
      { seed: 'landing-ada', hue: 245 },
      { seed: 'landing-linus', hue: 150 },
      { seed: 'landing-grace', hue: 30 },
      { seed: 'landing-ada', hue: 245 },
    ];
    largeTeamAvatars.forEach((el, idx) => {
      const spec = messageSpecs[idx % messageSpecs.length];
      mountedAvatars.push({
        instance: mountDomBloubAvatar(el, {
          seed: spec.seed,
          hue: spec.hue,
          offset: idx * 2.1,
          interactiveLook: true,
        }),
        cellIndex: null,
      });
    });

    // Persist window avatar (Ada)
    const persistAvatarEl = root.querySelector<HTMLElement>(
      '.landing-persist-window .landing-window-bar > span:first-child'
    );
    if (persistAvatarEl) {
      mountedAvatars.push({
        instance: mountDomBloubAvatar(persistAvatarEl, {
          seed: 'landing-ada',
          hue: 245,
          offset: 0.8,
          interactiveLook: true,
        }),
        cellIndex: null,
      });
    }

    // 2) Honeycomb 12x22 grid in "Meet your first teammate"
    const honeycombCells = Array.from(
      root.querySelectorAll<HTMLElement>('.agent-honeycomb-cell[data-kind="agent"]')
    );
    honeycombCells.forEach((cell, idx) => {
      const offset = (((Math.imul(idx + 1, 2654435761) >>> 0) / 4294967296) * 60);
      const inst = mountDomBloubAvatar(cell, {
        seed: `post-cta-${idx}`,
        hue: null,
        shape: 'squircle',
        className: 'agent-honeycomb-avatar',
        offset,
      });
      cell.addEventListener('pointerenter', () => {
        hoveredHoneycombIndex = idx;
      });
      cell.addEventListener('pointerleave', () => {
        if (hoveredHoneycombIndex === idx) hoveredHoneycombIndex = null;
      });
      mountedAvatars.push({
        instance: inst,
        cellIndex: idx,
      });
    });

    // Shared animation loop for mounted Bloub avatars when visible
    let avatarRaf = 0;
    const avatarStart = performance.now();
    let frameTick = 0;
    const animateAvatars = (now: number) => {
      frameTick++;
      const elapsed = (now - avatarStart) / 1000;
      // Update at 30fps for silky performance across 250+ SVGs
      if (frameTick % 2 === 0) {
        for (let i = 0; i < mountedAvatars.length; i++) {
          const item = mountedAvatars[i];
          const isHovered = item.cellIndex !== null && item.cellIndex === hoveredHoneycombIndex;
          stepMountedBloubAvatar(item.instance, elapsed, isHovered);
        }
      }
      avatarRaf = requestAnimationFrame(animateAvatars);
    };
    avatarRaf = requestAnimationFrame(animateAvatars);

    // E. OpenBot for Teams sticky stack scroll handler + Rising Footer Glow scroll handler
    const teamsStack = root.querySelector<HTMLElement>('.landing-teams-stack');
    const progressItems = Array.from(
      root.querySelectorAll<HTMLElement>('.landing-teams-progress-item')
    );

    // Make progress items clickable to scroll smoothly to that card
    progressItems.forEach((item, index) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const cards = teamsStack ? Array.from(teamsStack.querySelectorAll(':scope > li')) : [];
        cards[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    let scrollRaf = 0;
    const updateScrollEffects = () => {
      scrollRaf = 0;
      if (teamsStack) {
        const cards = Array.from(teamsStack.querySelectorAll<HTMLElement>(':scope > li'));
        const style = getComputedStyle(teamsStack);
        const step = Number.parseFloat(style.getPropertyValue('--landing-teams-step')) || 28;
        const gap = Number.parseFloat(style.rowGap) || 24;
        let activeIdx = 0;
        cards.forEach((card, n) => {
          const next = cards[n + 1];
          const rect = card.getBoundingClientRect();
          const dist = next ? next.getBoundingClientRect().top - rect.top : 0;
          const covered = next
            ? Math.min(1, Math.max(0, 1 - (dist - step) / (rect.height + gap - step)))
            : 0;
          card.style.setProperty('--landing-teams-covered', covered.toFixed(3));
          if (covered > 0.5) activeIdx = n + 1;
        });
        progressItems.forEach((pItem, idx) => {
          if (idx === activeIdx) pItem.setAttribute('data-active', '');
          else pItem.removeAttribute('data-active');
        });
      }

      if (glowRef.current) {
        const rect = glowRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height || 1)));
        setGlowScale(progress);
      }
    };

    const onScrollOrResize = () => {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(updateScrollEffects);
      }
    };
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    updateScrollEffects();

    // F. Intercept internal links so every button/card works seamlessly without 404 navigation
    const onRootClick = (ev: MouseEvent) => {
      const target = (ev.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      if (!href || href.startsWith('http://') || href.startsWith('https://')) {
        return; // allow external links (GitHub, Discord, X)
      }
      ev.preventDefault();

      if (href.startsWith('/contact')) {
        setContactSubmitted(false);
        setContactModalOpen(true);
        return;
      }
      if (href.startsWith('/compare/')) {
        const slug = href.replace('/compare/', '').replace(/\/$/, '');
        setCompareModalSlug(slug || 'grok-bot');
        return;
      }
      if (href === '/compare') {
        root.querySelector('#landing-compare-title')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (href === '/pricing') {
        root.querySelector('#pricing-title')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (href === '/teams') {
        root.querySelector('#teams')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (href.startsWith('/download/macos') || href === '#download-macos') {
        setDownloadModalPlatform('macos');
        return;
      }
      if (href.startsWith('/download/windows') || href === '#download-windows') {
        setDownloadModalPlatform('windows');
        return;
      }
      if (href.startsWith('/download/linux') || href === '#download-linux') {
        setDownloadModalPlatform('linux');
        return;
      }
      if (href.startsWith('/download/ios') || href === '#download-ios') {
        setDownloadModalPlatform('ios');
        return;
      }
      if (href.startsWith('/download/android') || href === '#download-android') {
        setDownloadModalPlatform('android');
        return;
      }
      if (href === '/download') {
        root.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (href.startsWith('/providers')) {
        root.querySelector('#features-title')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // Default smooth scroll to top or relevant section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    root.addEventListener('click', onRootClick);

    return () => {
      revealObs.disconnect();
      triggerBtn?.removeEventListener('click', onTriggerClick);
      document.removeEventListener('pointerdown', onDocPointerDown);
      menuBtn?.removeEventListener('click', onMenuBtnClick);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      root.removeEventListener('click', onRootClick);
      cancelAnimationFrame(avatarRaf);
      cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return (
    <div ref={pageRef} className="landing-page">
      {/* 1. Exact Top Navigation Header */}
      <div dangerouslySetInnerHTML={{ __html: HEADER_HTML }} />

      <main>
        {/* 2. Hero Section: WebGL2 Beam + Hero Copy + Interactive OpenBot Desktop App Preview */}
        <section className="landing-hero" aria-labelledby="landing-title">
          {/* WebGL2 Volumetric Light Beam */}
          <div ref={beamContainerRef} className="landing-beam" aria-hidden="true">
            <canvas ref={beamCanvasRef} className="landing-beam-canvas" />
          </div>

          {/* Hero Copy & Actions */}
          <div
            ref={heroCopyWrapperRef}
            style={{ display: 'contents' }}
            dangerouslySetInnerHTML={{ __html: HERO_COPY_HTML }}
          />

          {/* Interactive OpenBot Application Preview */}
          <section
            ref={previewSectionRef}
            className="landing-preview landing-app-preview t-skel is-revealed"
            aria-labelledby="app-preview-title"
            data-enter="preview"
            data-preview-state="shown"
          >
            <h2 id="app-preview-title" className="landing-visually-hidden">
              Interactive OpenBot application preview
            </h2>
            <span className="landing-preview-window-controls" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <div
              className="landing-preview-placeholder t-skel-skeleton"
              role="status"
              aria-label="Loading OpenBot preview"
              aria-hidden="true"
            />
            <div className="landing-preview-stage t-skel-content">
              <OpenBotAppPreview />
            </div>
          </section>
        </section>

        {/* 3. "Your agents talk to each other." Interactive Canvas Network */}
        <section
          ref={networkSectionRef}
          className="landing-section landing-network"
          aria-labelledby="network-title"
          data-playing={networkPlaying ? 'true' : 'false'}
        >
          <div ref={networkStageRef} className="landing-network-stage">
            <canvas ref={networkCanvasRef} className="landing-network-canvas" />
            <header
              ref={networkHeadingRef}
              className="landing-section-heading landing-network-heading"
            >
              <h2 id="network-title">
                {['Your', 'agents', 'talk', 'to', 'each', 'other.'].map((word, idx) => (
                  <React.Fragment key={word}>
                    <span
                      className="landing-network-word"
                      style={{ '--landing-network-word': idx } as React.CSSProperties}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                ))}
              </h2>
              <p className="landing-network-description">
                They ask, hand off and review. Add agents, and the team grows around the work.
              </p>
            </header>
            <div
              ref={networkMarksRef}
              style={{ display: 'contents' }}
              dangerouslySetInnerHTML={{ __html: NETWORK_MARKS_HTML }}
            />
          </div>
        </section>

        {/* 4. "What OpenBot does" Bento Grid */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: FEATURES_HTML }}
        />

        {/* 5. "What it costs" $0 Section */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: PRICING_HTML }}
        />

        {/* 6. "OpenBot for Teams" Sticky Stack Section */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: TEAMS_HTML }}
        />

        {/* 7. "Questions" FAQ + "Compare OpenBot" Cards */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: FAQ_HTML }}
        />

        {/* 8. "Download OpenBot" Platform Cards */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: DOWNLOAD_HTML }}
        />

        {/* 9. "Meet your first teammate" 12x22 Interactive Bloub Honeycomb */}
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: POST_CTA_HTML }}
        />
      </main>

      {/* 10. Footer */}
      <div
        style={{ display: 'contents' }}
        dangerouslySetInnerHTML={{ __html: FOOTER_HTML }}
      />

      {/* 11. Rising Ambient Footer Glow */}
      <div
        ref={glowRef}
        className="landing-glow"
        aria-hidden="true"
        data-slot="landing-glow"
      >
        <div
          className="landing-glow-rise"
          style={
            {
              transform: `scaleY(${glowScale.toFixed(3)})`,
              '--landing-glow-rise-ms': '1100ms',
            } as React.CSSProperties
          }
        >
          <svg
            className="landing-glow-svg"
            viewBox="0 0 1271 599"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="footer-glow-grad" x1="0" y1="1" x2="0" y2="0">
                {GLOW_STOPS.map((s, i) => (
                  <stop
                    key={i}
                    offset={s.offset}
                    stopColor={s.color}
                    stopOpacity={s.opacity}
                  />
                ))}
              </linearGradient>
              <filter id="footer-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" />
              </filter>
            </defs>
            {GLOW_HEIGHTS.map((h, i) => {
              const colW = 1271 / 9;
              return (
                <g key={i} filter="url(#footer-glow-blur)">
                  <rect
                    x={i * colW}
                    y={599 - h}
                    width={colW * 1.23}
                    height={h}
                    fill="url(#footer-glow-grad)"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Modal: Platform Download & System Requirements */}
      {downloadModalPlatform && (
        <div
          onClick={() => setDownloadModalPlatform(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-white/15 p-6 text-white shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg
                    viewBox={PLATFORM_INFO[downloadModalPlatform].svgViewBox}
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d={PLATFORM_INFO[downloadModalPlatform].svgPath} />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold">
                    OpenBot for {PLATFORM_INFO[downloadModalPlatform].label}
                  </h3>
                  <p className="text-xs text-[#a1a1aa]">Version 0.54.0 · Free for noncommercial use</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDownloadModalPlatform(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1">
              <div className="text-xs font-medium text-[#a1a1aa]">System Requirements</div>
              <div className="text-sm text-[#e4e4e7]">
                {PLATFORM_INFO[downloadModalPlatform].requirements}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-[#a1a1aa]">Installation Steps</div>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-[#d4d4d8]">
                {PLATFORM_INFO[downloadModalPlatform].steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex gap-1.5">
                {(['macos', 'windows', 'linux', 'ios', 'android'] as PlatformKey[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDownloadModalPlatform(p)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      downloadModalPlatform === p
                        ? 'bg-white text-black'
                        : 'bg-white/[0.06] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    {PLATFORM_INFO[p].label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDownloadModalPlatform(null)}
                className="px-4 py-2 rounded-full bg-[#a46cf5] hover:bg-[#9353f0] text-black font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Compare OpenBot */}
      {compareModalSlug && (
        <div
          onClick={() => setCompareModalSlug(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-[#18181b] border border-white/15 p-6 text-white shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold capitalize">
                OpenBot vs {compareModalSlug.replace(/-/g, ' ')}
              </h3>
              <button
                type="button"
                onClick={() => setCompareModalSlug(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#d4d4d8] leading-relaxed">
              OpenBot runs a persistent team of AI agents directly on your computer at $0 extra cost, using the ChatGPT, Claude, Gemini, or Grok subscription you already pay for.
            </p>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/10 text-[#a1a1aa]">
                    <th className="py-2.5 px-3.5 font-medium">Capability</th>
                    <th className="py-2.5 px-3.5 font-medium text-white">OpenBot</th>
                    <th className="py-2.5 px-3.5 font-medium capitalize">
                      {compareModalSlug.replace(/-/g, ' ')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[#e4e4e7]">
                  <tr>
                    <td className="py-2.5 px-3.5">App price</td>
                    <td className="py-2.5 px-3.5 text-[#3ecf8e] font-medium">$0 (Free)</td>
                    <td className="py-2.5 px-3.5 text-[#a1a1aa]">Paid seat / usage markup</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5">Use existing AI plans</td>
                    <td className="py-2.5 px-3.5 text-[#3ecf8e]">✓ Codex, Claude, Gemini, Grok</td>
                    <td className="py-2.5 px-3.5 text-[#a1a1aa]">Single provider or API billing</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5">Data &amp; workspace storage</td>
                    <td className="py-2.5 px-3.5 text-[#3ecf8e]">✓ Stored on your computer</td>
                    <td className="py-2.5 px-3.5 text-[#a1a1aa]">Cloud-hosted servers</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5">Switch provider mid-thread</td>
                    <td className="py-2.5 px-3.5 text-[#3ecf8e]">✓ Keeps agent &amp; context</td>
                    <td className="py-2.5 px-3.5 text-[#a1a1aa]">Locked to single model family</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCompareModalSlug(null)}
                className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors"
              >
                Close comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Contact Us */}
      {contactModalOpen && (
        <div
          onClick={() => setContactModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#18181b] border border-white/15 p-6 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contact Synthetify Labs</h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-[#a1a1aa] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {contactSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#3ecf8e]/20 text-[#3ecf8e] flex items-center justify-center mx-auto text-lg">
                  ✓
                </div>
                <p className="text-sm font-medium text-white">Message received</p>
                <p className="text-xs text-[#a1a1aa]">
                  Thanks for reaching out about OpenBot. Our team will reply to {contactEmail} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!contactEmail.trim() || !contactMessage.trim()) return;
                  setContactSubmitted(true);
                }}
                className="space-y-3.5"
              >
                <p className="text-xs text-[#a1a1aa]">
                  Ask us about OpenBot for Teams, managed servers, custom integrations, or commercial licensing.
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#d4d4d8] mb-1">Work email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.05] border border-white/15 text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#a46cf5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#d4d4d8] mb-1">How can we help?</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your team size, AI providers, or questions..."
                    className="w-full p-3 rounded-lg bg-white/[0.05] border border-white/15 text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#a46cf5]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-white/[0.08] text-white text-xs font-medium hover:bg-white/[0.12]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90"
                  >
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
