interface readDetailJson {
  datas: readDetailData[];
  hasMore: number;
  isNewest: number;
  validDayMinSecond: number;
}

interface readDetailData {
  baseTimestamp: number;
  timeMeta: TimeMeta;
  readMeta: ReadMeta;
}

interface ReadMeta {
  bookFinish: number;
  bookRead: number;
  notes: number;
  words: number;
  books: readDetailBook[];
}

interface readDetailBook {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  type: number;
  totalReadingTime: number;
  secret: number;
  periodFinish: number;
}

interface TimeMeta {
  lastTotalReadTime: number;
  totalReadTime: number;
  readTimeList: number[];
  totalCount: number;
}

export {readDetailJson, readDetailData}