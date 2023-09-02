interface ShelfDataType {
	synckey?: number;
	bookProgress?: BookProgress[];
	removed?: unknown[];
	removedArchive?: unknown[];
	lectureRemoved?: unknown[];
	archive?: Archive[];
	books?: Book[];
	lectureBooks?: unknown[];
	lectureSynckey?: number;
	lectureUpdate?: unknown[];
	mp?: Mp;
	errMsg?: string
}

interface ShelfErrorDataType {
	errMsg: string,
	[propName: string]: unknown
}

interface Mp {
	show: number;
	book: MpBook;
}

interface MpBook {
	bookId: string;
	title: string;
	cover: string;
	secret: number;
	payType: number;
	paid: number;
	updateTime: number;
	readUpdateTime: number;
	isTop: boolean;
}

interface Book {
	bookId: string;
	title: string;
	author: string;
	cover: string;
	version: number;
	format: string;
	type: number;
	price: number;
	originalPrice: number;
	soldout: number;
	bookStatus: number;
	payType: number;
	lastChapterCreateTime: number;
	centPrice: number;
	finished: number;
	maxFreeChapter: number;
	free: number;
	mcardDiscount: number;
	ispub: number;
	updateTime: number;
	publishTime: string;
	category?: string;
	hasLecture: number;
	lastChapterIdx: number;
	paperBook: PaperBook;
	secret: number;
	readUpdateTime: number;
	finishReading: number;
	paid?: number;
	extra_type?: number;
	lPushName?: string;
	authorVids?: string;
	isTop?: boolean;
}

interface PaperBook {
	skuId: string;
}

interface Archive {
	archiveId: number;
	name: string;
	bookIds: string[];
	removed: unknown[];
	lectureBookIds: unknown[];
	lectureRemoved: unknown[];
	isTop?: boolean;
}

interface BookProgress {
	bookId: string;
	progress: number;
	chapterUid: number;
	chapterOffset: number;
	chapterIdx: number;
	appId: string;
	updateTime: number;
	synckey?: number;
}

export {ShelfDataType as ShelfDataTypeJson, ShelfErrorDataType, Book, Archive}