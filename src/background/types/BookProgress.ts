
export interface BookProgress {
	bookId: string;
	progress: number;
	chapterUid: number;
	chapterOffset: number;
	chapterIdx: number;
	appId: string;
	updateTime: number;
	synckey?: number;
}
