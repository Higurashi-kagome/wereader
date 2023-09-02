import { Archive } from './Archive'
import { Book } from './Book'
import { BookProgress } from './BookProgress'
import { Mp } from './Mp'

export interface ShelfJson {
	synckey: number;
	bookProgress: BookProgress[];
	removed: unknown[];
	removedArchive: unknown[];
	lectureRemoved: unknown[];
	archive: Archive[];
	books: Book[];
	lectureBooks: unknown[];
	lectureSynckey: number;
	lectureUpdate: unknown[];
	mp: Mp;
}
