import { Book } from './Book';

export interface ChapInfoJson {
  data: Datum[];
}

interface Datum {
  bookId: string;
  soldOut: number;
  clearAll: number;
  updated: ChapInfoUpdated[];
  removed: any[];
  synckey: number;
  book: Book;
}

export interface ChapInfoUpdated {
  chapterUid: number;
  chapterIdx: number;
  updateTime: number;
  readAhead: number;
  title: string;
  wordCount: number;
  price: number;
  paid: number;
  isMPChapter: number;
  level: number;
  files: string[];
  tar?: string;
  isCurrent?: boolean;
  anchors: any;
}