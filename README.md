# NJ Physics Site

Modern dark-textured rebuild of [physics.lk](https://physics.lk) — A/L Physics tuition by **Nilantha Jayasuriya** — as a component-driven React app with a scroll-driven 3D rocket journey, interactive glTF cards, and GSAP motion throughout.

**Copyright 2026 Physics.lk developed by Januth**

## Stack

- **Vite + React 18 + TypeScript (TSX)** — component architecture, no monolithic HTML
- **Tailwind CSS v3** (compiled via PostCSS) over a **textured-dark** theme (film-grain + engineering grid, never flat black)
- **GSAP (ScrollTrigger + ScrollTo)** + **Lenis** inertia scrolling
- **three.js + @react-three/fiber + @react-three/drei** — seven procedurally generated glTF models

## The scroll-journey rocket (centerpiece)

A global fixed R3F canvas hosts a rocket on a launchpad in a low-poly terrain landscape:

- **Top of page:** rocket stands at the top-right edge, camera far away.
- **As you scroll:** the camera approaches — rocket grows, swings to dead-center.
- **At the footer:** the rocket sits full-body center, between contact info (left) and the Sinhala tagline (right).
- **Click the rocket:** exactly **5-second** GSAP-driven blast-off back to the top — engines fire (additive flame particles), pad smoke, camera locked center while the page scrolls past as a parallax "flying past Earth" illusion.
- **Day/Night:** the environment follows the system theme — sunlit terrain in light mode, starfield in dark mode.

Regenerate all models after editing: `npm run models`

## Procedural glTF models (`scripts/build-models.mjs`)

| Model | File | Used for |
| --- | --- | --- |
| Rocket + launchpad | `public/models/rocket.glb` | Scroll journey + scroll-to-top launch |
| Open physics book | `public/models/open-book.glb` | "Theory & Revision" card — pages flip automatically, speed reacts to scroll velocity + hover |
| Exam paper | `public/models/exam-paper.glb` | "Papers" card — red-pen grading animation on scroll-past/hover |
| Vernier caliper | `public/models/vernier-caliper.glb` | Practicals section — slides in from the side via ScrollTrigger, jaw closes onto the specimen |
| Sri Lanka map | `public/models/sri-lanka.glb` | "27 exam halls" section — 27 glowing pulsing pins placed from real lat/lng |
| Floating study island / prism | `public/models/*.glb` | Retired v1 assets (kept on disk) |

## Motion features

Cinematic hero reveals · kinetic text scramble · spotlight tilt cards (perspective 1000px) · velocity-reactive marquee · magnetic buttons · textured-dark glassmorphism navbar whose **Student Login button is visible only at scrollY = 0**.

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
npm run models     # regenerate the glTF models
```

## Structure

```
public/
  assets/img/        # extracted from live site (logo, timetables, gallery, testimonials)
  models/            # 7 procedural glTF models
scripts/build-models.mjs
src/
  components/{layout,ui,three}/
  data/              # all copy, extracted & documented in CONTENT-AUDIT.md
  hooks/             # gsap context, scramble, tilt, velocity ticker, magnetic
  pages/             # one file per route
  styles/globals.css # textured-dark theme
```

All factual copy was extracted from the live site and is catalogued in [CONTENT-AUDIT.md](CONTENT-AUDIT.md); page data lives in `src/data/*`.
