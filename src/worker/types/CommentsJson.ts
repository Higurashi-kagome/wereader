import { CommentReview } from './CommentReview'

export interface CommentsJson {
    synckey: number;
    totalCount: number;
    reviews: {
    reviewId: string;
    review: CommentReview;
    }[];
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
