export const site = {
  name: 'NJ Physics',
  teacher: 'Nilantha Jayasuriya',
  tagline: 'Advanced Level Physics for All Island',
  footerTagline:
    'යුගයේ අතිශ්‍රේෂ්ඨතම A/L භෞතික විද්‍යා ගුරුවරයා — NJ Physics සමඟ ඔබේ ජයග්‍රහණය තහවුරු කරගන්න.',
  phone: '+94704 731 415',
  phoneHref: 'tel:+94704731415',
  hotline: '+94 33 221 8614',
  email: 'callcentrenj@gmail.com',
  altEmail: 'physicslk@gmail.com',
  address: 'Gampaha, Sri Lanka',
  hours: 'Mon - Sat: 07:00am - 06:00pm',
} as const

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/classes', label: 'Classes' },
  { to: '/exams', label: 'Exams' },
  { to: '/helping-hand', label: 'Helping Hand' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
] as const

export const footerLinks = [
  ...navLinks.slice(0, 2),
  { to: '/reviews', label: 'Review' },
  navLinks[2],
  { to: '/blog', label: 'Blog' },
  navLinks[4],
  navLinks[5],
] as const

export const socials = {
  facebook: 'https://www.facebook.com/njphysics/',
  instagram: 'https://www.instagram.com/nj_physics?igsh=NHlnaGhnd2lwM284',
  tiktok: 'https://www.tiktok.com/@nilanthajayasuriya2025?_t=ZS-8vLsxdYXp1G&_r=1',
  youtube: 'https://www.youtube.com/@NilanthaJayasuriyaPhysics',
} as const

/** Protected student portals — hrefs must stay byte-for-byte identical. */
export const portalUrls = {
  scienceCenter: 'https://physics.lk/sciencescenter_students/login.php',
  gurumandala: 'https://physics.lk/gurumandala_students/login.php',
  nawaraAcbs: 'https://physics.lk/acbs_students/login.php',
  onlineEclass: 'https://physicsapp.eclass.lk/login',
  onlineEclassRegister: 'https://physicsapp.eclass.lk/register/new',
} as const
