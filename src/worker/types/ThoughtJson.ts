import { Author } from './Author'
import { ThoughtComment } from './ThoughtComment'
import { ThoughtReview } from './ThoughtReview'

interface ReviewData {
    reviewId: string;
    review: ThoughtReview;
    commentsCount?: number;
    comments?: ThoughtComment[];
    likesCount?: number;
    likes?: Author[];
}

/**
 * 从服务器获取到的 json 数据
 */
export interface ThoughtJson {
  synckey: number;
  totalCount: number;
  reviews: ReviewData[];
  removed: unknown[];
  atUsers: unknown[];
  refUsers: unknown[];
  columns: unknown[];
  hasMore: number;
}

export interface MedalInfo {
  id: string;
  desc: string;
}
