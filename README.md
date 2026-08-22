# NJ Physics Site

Modern dark-glassmorphism rebuild of [physics.lk](https://physics.lk) — A/L Physics tuition by **Nilantha Jayasuriya** — as a component-driven React app with interactive 3D and scroll-driven motion.

**Developed by Januth Nimnal.**

## Stack

- **Vite + React 18 + TypeScript (TSX)** — component architecture, no monolithic HTML
- **Tailwind CSS v3** (compiled via PostCSS)
- **GSAP + ScrollTrigger** — pinned scrub text, staggered reveals, velocity effects
- **Lenis** — inertia smooth scrolling, driven by the GSAP ticker
- **three.js + @react-three/fiber + drei** — procedural GLB models rendered in React
- **lucide-react** — UI iconography

## Interactive 3D models

Both models are generated procedurally (no external modeling tool) by [`scripts/build-models.mjs`](scripts/build-models.mjs) using three.js primitives + `GLTFExporter`:

| Model | File | Used for |
| --- | --- | --- |
| Floating Physics Study Island | `public/models/study-island.glb` | Main hero (`/`) — books ("A/L PHYSICS" / "විද්‍යාව" spines), calculator, glowing pendulum, floating lightbulb. Click the bulb! |
| Optics & Spectrum Prism | `public/models/prism.glb` | Practicals band + small accents on every sub-page hero |

Regenerate after editing: `npm run models`

## Motion features

1. Cinematic hero sequence — staggered type reveals + ambient light sweep
2. Kinetic text scramble — headers decode through hex/ASCII on scroll into view
3. Interactive spotlight cards — 3D tilt (`perspective: 1000px`) + radial cursor lighting
4. Kinetic scrub — pinned display text filling as you scroll
5. Velocity-sensitive ticker — marquee speed/skew react to scroll velocity
6. Magnetic auto-hide dock — floating pill navbar with magnet hover physics

All motion respects `prefers-reduced-motion`.

## Routes

`/` · `/about` · `/classes` · `/exams` · `/helping-hand` · `/reviews` · `/blog` · `/contact` · `/student-login` · `*` 404

> **Protected URLs:** the four student portals on `/student-login` are plain external anchors that must keep their exact original addresses (`sciencescenter_students`, `gurumandala_students`, `acbs_students` login pages + `physicsapp.eclass.lk/login`). See `src/data/site.ts`. Every other internal link is a React Router route.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the build → http://localhost:4173
npm run typecheck  # tsc --noEmit
npm run models     # regenerate the two .glb models
```

## Structure

```
public/
  assets/img/        # extracted from live site (logo, timetables, gallery, testimonials)
  models/            # study-island.glb, prism.glb (generated)
scripts/build-models.mjs
src/
  components/{layout,ui,three}/
  data/              # all copy, extracted & documented in CONTENT-AUDIT.md
  hooks/             # gsap context, scramble, tilt, velocity ticker, magnetic, auto-hide dock
  pages/             # one file per route
  styles/globals.css
```

All factual copy was extracted from the live site and is catalogued in [CONTENT-AUDIT.md](CONTENT-AUDIT.md); page data lives in `src/data/*`.
