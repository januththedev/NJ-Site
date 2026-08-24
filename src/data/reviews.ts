import content from '../content/site-content.json'

export interface Review {
  name: string
  year: string
  quote: string
  rank?: number
  thumb?: string
}

export const topReviews: Review[] = content.topReviews
export const studentReviews: Review[] = content.studentReviews
