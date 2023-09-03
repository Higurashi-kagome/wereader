import { Book } from './Book'
import { Updated } from './Updated'

interface Chapter {
    bookId: string;
    chapterUid: number;
    chapterIdx: number;
    title: string;
}

export interface MarksJson {
    synckey: number;
    updated: Updated[];
    removed: unknown[];
    chapters: Chapter[];
    book: Book;
}
