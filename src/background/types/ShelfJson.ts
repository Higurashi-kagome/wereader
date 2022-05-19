import { Archive } from './Archive';
import { Book } from './Book';
import { BookProgress } from './BookProgress';
import { Mp } from './Mp';

export interface ShelfJson {
	synckey: number;
	bookProgress: BookProgress[];
	removed: any[];
	removedArchive: any[];
	lectureRemoved: any[];
	archive: Archive[];
	books: Book[];
	lectureBooks: any[];
	lectureSynckey: number;
	lectureUpdate: any[];
	mp: Mp;
}
