import type { Content } from '../content/store'

export function getExamsData(content: Content) {
  return {
    kicker: 'Exams · Location',
    title: 'Accessible Exam Halls Islandwide — For You!',
    body: 'Join the mock-exam network at a centre near you. Every centre has its own Telegram group for updates, hall details and results.',
    centres: content.centres,
  }
}
