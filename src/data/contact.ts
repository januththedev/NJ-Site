import type { Content } from '../content/store'

export function getContactData(content: Content) {
  return {
    title: "We're Here to Help",
    cards: content.contactCards,
    telegramIntroSi: content.telegramIntroSi,
    telegramGroups: content.telegramGroups,
  }
}
