import type { Content } from '../content/store'

export interface Review {
  name: string
  year: string
  quote: string
  rank?: number
  thumb?: string
}

export function getReviewsData(content: Content) {
  return {
    topReviews: content.topReviews as Review[],
    studentReviews: content.studentReviews as Review[],
  }
}
