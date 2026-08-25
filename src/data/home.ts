import type { Content } from '../content/store'
import { getExamsData } from './exams'

export const scheduleHighlights = {
  title: 'Learn Smarter — Class Times Tailored for You',
  kicker: 'Class Schedule Highlights',
  venues: ['සුසිප්වන් · GAMPAHA', 'ONLINE · ලංකාවටම', 'සයන්ස් සෙන්ටර් · GALLE'],
}

export const cards = [
  {
    id: 'theory-revision',
    model: 'book' as const,
    title: 'Theory & Revision',
    body: 'Full-syllabus theory taught practically, with structured revision sessions and short notes that make every chapter stick. Turn the pages — scroll or hover to flip faster.',
  },
  {
    id: 'papers',
    model: 'paper' as const,
    title: 'Papers',
    body: 'MCQ & structured paper discussions, mock exams with marking, and A/B/C/S grading that builds exam-day confidence. Watch it get graded.',
  },
]

export const practicalsBand = {
  kicker: 'Practical Sessions',
  title: "Come, let's learn physics with practicals.",
  body:
    'Theory alone is never enough. Measure, observe and verify — dedicated practical sessions with real instruments, because physics you witness is physics you never forget.',
}

export const ctaBand = {
  header: 'Ready to learn with Nilantha Sir',
  sub: 'A/L Physics — Theory · Revision · Paper · Practicals.',
}

export function getHomeData(content: Content) {
  const { centres } = getExamsData(content)
  return {
    hero: {
      eyebrow: 'NJ PHYSICS · NILANTHA JAYASURIYA',
      titleTop: 'Best Physics',
      titleBottom: 'Teaching.',
      subtitle:
        "Sri Lanka's most trusted A/L Physics class — Theory, MCQ, Structured & Past Paper Discussions. Islandwide and online.",
      badges: [
        { kicker: 'HELPING HAND', line: 'Together We Grow.' },
        { kicker: 'FLEXIBLE TIME', line: 'Learn at Your Place.' },
      ],
      stats: content.heroStats,
    },
    aboutTeaser: {
      eyebrow: '#1 Best Physics Teacher',
      title: 'The Guiding Star Behind Sri Lanka’s Top Physics Achievers!',
      rankLine: content.aboutTeaser.rankLine,
      bodySi:
        'මෙවරත් අපගේ පංතියෙන්! මෙවරත් දිවයිනේ විශිෂ්ටයන් රැසක් බිහි කරමින් ළමුන් 1000+ කට අධික සංඛ්‍යාවකගේ A/L කඩයිම ජය ගැනීමට මඟ පෙන්වූ ඒ අසහාය ගුරුවරයා සමඟ ඔබත් එකතු වන්න.',
      stats: content.aboutTeaser.stats,
    },
    coverage: {
      kicker: 'Island wide coverage',
      // {count} in the CMS value is replaced with the live centre count
      title: content.coverageTitle.replace('{count}', String(centres.length)),
      body: 'Join the mock-exam network at a centre near you — every hall has its own Telegram group for updates and results.',
    },
  }
}
