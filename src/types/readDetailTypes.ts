interface TimeMeta {
    lastTotalReadTime: number;
    totalReadTime: number;
    readTimeList: number[];
    totalCount: number;
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

interface ReadMeta {
    bookFinish: number;
    bookRead: number;
    notes: number;
    words: number;
    books: readDetailBook[];
}

interface readDetailData {
    baseTimestamp: number;
    timeMeta: TimeMeta;
    readMeta: ReadMeta;
}

interface readDetailJson {
  datas: readDetailData[];
  hasMore: number;
  isNewest: number;
  validDayMinSecond: number;
}

export { readDetailJson, readDetailData }
