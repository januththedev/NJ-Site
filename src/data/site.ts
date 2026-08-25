import type { Content } from '../content/store'

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

/** Protected student portals — hrefs must stay byte-for-byte identical. */
export const portalUrls = {
  scienceCenter: 'https://physics.lk/sciencescenter_students/login.php',
  gurumandala: 'https://physics.lk/gurumandala_students/login.php',
  nawaraAcbs: 'https://physics.lk/acbs_students/login.php',
  onlineEclass: 'https://physicsapp.eclass.lk/login',
  onlineEclassRegister: 'https://physicsapp.eclass.lk/register/new',
} as const

export function getSiteData(content: Content) {
  return {
    site: {
      name: 'NJ Physics',
      teacher: 'Nilantha Jayasuriya',
      tagline: 'Advanced Level Physics for All Island',
      footerTagline: content.site.footerTagline,
      phone: content.site.phone,
      phoneHref: content.site.phoneHref,
      hotline: '+94 33 221 8614',
      email: content.site.email,
      altEmail: 'physicslk@gmail.com',
      address: content.site.address,
      hours: content.site.hours,
    },
    socials: {
      facebook: content.socials.facebook,
      instagram: content.socials.instagram,
      tiktok: content.socials.tiktok,
      youtube: content.socials.youtube,
    },
  }
}
