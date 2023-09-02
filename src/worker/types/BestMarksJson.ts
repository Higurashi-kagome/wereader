import { Chapter } from './Chapter'
import { User } from './User'

/**
 * 为方便处理而生成的数据
 */
export interface BestMarksData {
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
  isCurrent: boolean;
  bestMarks: BestMark[];
  tar?: string;
}

interface BestMark {
  bookId: string;
  userVid: number;
  bookmarkId: string;
  chapterUid: number;
  range: number;
  markText: string;
  totalCount: number;
  users: User[];
}

/**
 * 从服务器获取到的 json 数据
 */
export interface BestMarksJson {
  synckey: number;
  totalCount: number;
  items: Item[];
  chapters: Chapter[];
}

export interface Item {
  bookId: string;
  userVid: number;
  bookmarkId: string;
  chapterUid: number;
  range: number;
  markText: string;
  totalCount: number;
  users: User[];
}