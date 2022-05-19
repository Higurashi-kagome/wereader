import { Book } from './Book';
import { Updated } from './Updated';

export interface MarksJson {
  synckey: number;
  updated: Updated[];
  removed: any[];
  chapters: Chapter[];
  book: Book;
}

interface Chapter {
  bookId: string;
  chapterUid: number;
  chapterIdx: number;
  title: string;
}