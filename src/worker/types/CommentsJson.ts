import { CommentReview } from './CommentReview';

export interface CommentsJson {
	synckey: number;
	totalCount: number;
	reviews: {
	reviewId: string;
	review: CommentReview;
	}[];
	removed: any[];
	atUsers: any[];
	refUsers: any[];
	columns: any[];
	hasMore: number;
}

export interface MedalInfo {
	id: string;
	desc: string;
}