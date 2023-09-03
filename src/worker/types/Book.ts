export interface Book {
    bookId: string;
    title: string;
    cover: string;
    format: string;
    version: number;
    soldout: number;
    bookStatus: number;
    author: string;
    lastChapterCreateTime?: number;
    centPrice?: number;
    finished?: number;
    maxFreeChapter?: number;
    free?: number;
    mcardDiscount?: number;
    ispub?: number;
    updateTime?: number;
    publishTime?: string;
    hasLecture?: number;
    lastChapterIdx?: number;
    paperBook?: {
        skuId: string;
    };
    secret?: number;
    readUpdateTime?: number;
    finishReading?: number;
    paid?: number;
    extra_type?: number;
    lPushName?: string;
    authorVids?: string;
    isTop?: boolean;
    type?: number;
    originalPrice?: number;
    category?: string;
    payType?: number;
    price?: number;
  }
