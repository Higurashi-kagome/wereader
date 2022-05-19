interface ShelfDataType {
	synckey?: number;
	bookProgress?: BookProgress[];
	removed?: any[];
	removedArchive?: any[];
	lectureRemoved?: any[];
	archive?: Archive[];
	books?: Book[];
	lectureBooks?: any[];
	lectureSynckey?: number;
	lectureUpdate?: any[];
	mp?: Mp;
	errMsg?: string
}

interface ShelfErrorDataType {
	errMsg: string,
	[propName: string]: any
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
	removed: any[];
	lectureBookIds: any[];
	lectureRemoved: any[];
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

export {ShelfDataType as ShelfDataTypeJson, ShelfErrorDataType, Book, Archive};