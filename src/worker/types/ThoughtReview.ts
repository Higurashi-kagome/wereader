import { Author } from './Author'
import { Book } from './Book'

export interface ThoughtReview {
	abstract: string;
	atUserVids?: unknown[];
	bookId: string;
	bookVersion: number;
	chapterUid: number;
	content: string;
	friendship?: number;
	htmlContent?: string;
	isPrivate?: number;
	range: string;
	createTime: number;
	title?: string;
	type: number;
	reviewId: string;
	userVid: number;
	topics: unknown[];
	isLike: number;
	isReposted: number;
	book: Book;
	chapterIdx: number;
	chapterTitle: string;
	author: Author;
	noReading?: number;
}
