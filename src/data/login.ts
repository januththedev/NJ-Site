import { portalUrls } from './site'

export const studentLogin = {
  kicker: 'WELCOME TO STUDENT PORTAL',
  title: 'Find Your Institute',
  chips: ['Online Islandwide', 'Gampaha', 'Nugegoda'],
  institutes: [
    {
      name: 'Science Center - Galle',
      loginUrl: portalUrls.scienceCenter,
      registerUrl: '',
    },
    {
      name: 'Gurumandala - Kaluthara',
      loginUrl: portalUrls.gurumandala,
      registerUrl: '',
    },
    {
      name: 'Nawara - Ambalangoda',
      loginUrl: portalUrls.nawaraAcbs,
      registerUrl: '',
    },
    {
      name: 'All Island - Online',
      loginUrl: portalUrls.onlineEclass,
      registerUrl: portalUrls.onlineEclassRegister,
    },
  ],
  callCentreSi:
    'ආයතනයට ලියාපදිංචි වීම, පන්ති සඳහා සහභාගී වීම, මුදල් ගෙවීම ඇතුළු අපගේ සේවාවන් පරිශීලනය සඳහා ඔබගේ පහසුව වෙනුවෙන් Call Centre — අපගේ නිරන්තර සහය සඳහා පහත දුරකථන අංක අමතන්න.',
  techSupportLabel: 'තාක්ෂණික සහාය:',
  numbers: [
    { display: '0704 731 415', href: 'tel:+94704731415' },
    { display: '0704 731 416', href: 'tel:+94704731416' },
  ],
}
