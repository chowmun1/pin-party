import { APP_NAME } from '../config';
import type { QuizRepository } from '../storage/QuizRepository';
import { newId, type Quiz } from '../types';

/*
 * A tiny demo quiz so the app isn't empty on first launch. Images are
 * hand-drawn SVG illustrations (no copyright concerns, tiny file size).
 */

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">${body}</svg>`;

const PYRAMIDS = svg(`
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#ffe5a8"/></linearGradient>
    <linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b765"/><stop offset="1" stop-color="#c98f3c"/></linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#s)"/>
  <circle cx="1250" cy="230" r="110" fill="#fff4c9"/>
  <polygon points="250,780 620,300 990,780" fill="#d9a04f"/><polygon points="620,300 990,780 760,780" fill="#b77d32"/>
  <polygon points="820,780 1080,420 1340,780" fill="#d9a04f"/><polygon points="1080,420 1340,780 1180,780" fill="#b77d32"/>
  <polygon points="1260,780 1400,580 1540,780" fill="#d9a04f"/><polygon points="1400,580 1540,780 1460,780" fill="#b77d32"/>
  <rect y="760" width="1600" height="240" fill="url(#d)"/>
  <g fill="#8a5a22"><ellipse cx="180" cy="850" rx="40" ry="10"/><rect x="160" y="805" width="44" height="40" rx="18"/><rect x="190" y="780" width="12" height="40"/><circle cx="206" cy="778" r="12"/></g>
`);

const FUJI = svg(`
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ec8ff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#s)"/>
  <polygon points="150,820 800,200 1450,820" fill="#4f6fa8"/>
  <polygon points="650,345 800,200 950,345 900,380 850,340 800,390 750,340 700,380" fill="#ffffff"/>
  <rect y="800" width="1600" height="200" fill="#5aa469"/>
  <rect y="880" width="1600" height="120" fill="#3c7dbf"/>
  <g fill="#ffb7d1">
    <circle cx="120" cy="140" r="90"/><circle cx="220" cy="90" r="80"/><circle cx="60" cy="260" r="70"/><circle cx="240" cy="210" r="70"/>
    <circle cx="1480" cy="120" r="90"/><circle cx="1380" cy="70" r="70"/><circle cx="1540" cy="250" r="70"/>
  </g>
  <g fill="#ff8fb5"><circle cx="160" cy="180" r="30"/><circle cx="1450" cy="160" r="30"/></g>
  <g fill="#c0392b"><rect x="1180" y="620" width="16" height="190"/><rect x="1320" y="620" width="16" height="190"/><rect x="1150" y="600" width="216" height="22" rx="6"/><rect x="1170" y="650" width="176" height="14"/></g>
`);

const BRIDGE = svg(`
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd1a1"/><stop offset="1" stop-color="#ff9a8b"/></linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#s)"/>
  <path d="M0,640 C300,560 500,600 700,640 L700,700 L0,700 Z" fill="#7d8f6a"/>
  <rect y="700" width="1600" height="300" fill="#2f6f8f"/>
  <g fill="#e2452f">
    <rect x="430" y="240" width="40" height="560"/><rect x="510" y="240" width="40" height="560"/>
    <rect x="1050" y="240" width="40" height="560"/><rect x="1130" y="240" width="40" height="560"/>
    <rect x="430" y="300" width="120" height="18"/><rect x="430" y="420" width="120" height="18"/>
    <rect x="1050" y="300" width="120" height="18"/><rect x="1050" y="420" width="120" height="18"/>
    <rect x="0" y="600" width="1600" height="28"/>
  </g>
  <g fill="none" stroke="#e2452f" stroke-width="10">
    <path d="M0,470 Q250,600 490,250 Q800,620 1110,250 Q1350,600 1600,470"/>
  </g>
  <g stroke="#e2452f" stroke-width="3">
    ${Array.from({ length: 30 }, (_, i) => {
      const x = 560 + i * 16.5;
      const t = (x - 490) / 620;
      // Matches the quadratic Bézier cable from (490,250) via (800,620) to (1110,250)
      const y = 250 + 2 * t * (1 - t) * 370;
      return `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${x.toFixed(0)}" y2="600"/>`;
    }).join('')}
  </g>
  <g fill="#ffffff" opacity="0.55"><ellipse cx="300" cy="560" rx="380" ry="40"/><ellipse cx="1350" cy="540" rx="320" ry="36"/></g>
`);

function svgBlob(markup: string): Blob {
  return new Blob([markup], { type: 'image/svg+xml' });
}

export function buildDemoQuiz(): Quiz {
  return {
    id: newId(),
    title: 'Demo: World Landmarks',
    description: `A tiny sample quiz to try ${APP_NAME}. Make your own with real photos!`,
    createdAt: Date.now(),
    photos: [
      { id: newId(), imageBlob: svgBlob(PYRAMIDS), caption: 'An ancient wonder in the desert', lat: 29.9792, lng: 31.1342 },
      { id: newId(), imageBlob: svgBlob(FUJI), caption: 'Snow-capped volcano in cherry blossom season', lat: 35.3606, lng: 138.7274 },
      { id: newId(), imageBlob: svgBlob(BRIDGE), caption: 'A famous red bridge, often wrapped in fog', lat: 37.8199, lng: -122.4783 },
    ],
  };
}

const SEEDED_KEY = 'pin-party:demo-seeded';
let seeding: Promise<void> | null = null;

/**
 * Adds the demo quiz the very first time the app runs on this device.
 * If the user later deletes it, it won't come back.
 */
export function ensureDemoQuiz(repo: QuizRepository): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      let seeded = false;
      try {
        seeded = localStorage.getItem(SEEDED_KEY) === '1';
      } catch {
        /* storage blocked: fall through and rely on the empty check */
      }
      if (seeded) return;
      const existing = await repo.listQuizzes();
      if (existing.length === 0) await repo.saveQuiz(buildDemoQuiz());
      try {
        localStorage.setItem(SEEDED_KEY, '1');
      } catch {
        /* ignore */
      }
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}
