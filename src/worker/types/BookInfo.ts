interface AuthorSeg {
    words: string;
    highlight: number;
    authorId: string;
}

interface CopyrightInfo {
    id: number;
    name: string;
    userVid: number;
    role: number;
    avatar: string;
}

interface Ranklist {
}

interface NewRatingDetail {
    // “推荐”人数
    good: number;
    // “一般”人数
    fair: number;
    // “不行”人数
    poor: number;
    recent: number;
    // 我的评论（比如“good”）
    myRating: string;
    // 评论总结（比如“好评如潮”）
    title: string;
}

interface RatingDetail {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    recent: number;
}

interface PaperBook {
    skuId: string;
}

interface Category {
    categoryId: number;
    subCategoryId: number;
    categoryType: number;
    title: string;
}

export interface BookInfo {
    bookId: string;
    // 书名
    title: string;
    // 作者
    author: string;
    // 译者
    translator?: string;
    // 封面
    cover: string;
    version: number;
    // 格式（比如 epub）
    format: string;
    type: number;
    // 电子书价格（书币个数）
    price: number;
    originalPrice: number;
    soldout: number;
    bookStatus: number;
    payType: number;
    // 简介
    intro: string;
    // 书价格（单位分）
    centPrice: number;
    // 是否读完（1 是 0 否）
    finished: number;
    maxFreeChapter: number;
    free: number;
    mcardDiscount: number;
    ispub: number;
    extra_type: number;
    cpid: number;
    publishTime: string;
    // 分类（主要分类）
    category: string;
    // 分类（所有）
    categories: Category[];
    hasLecture: number;
    lastChapterIdx: number;
    paperBook: PaperBook;
    blockSaveImg: number;
    language: string;
    hideUpdateTime: boolean;
    payingStatus: number;
    chapterSize: number;
    updateTime: number;
    onTime: number;
    unitPrice: number;
    marketType: number;
    // ISBN
    isbn: string;
    // 出版方
    publisher: string;
    // 总字数（单位个）
    totalWords: number;
    publishPrice: number;
    bookSize: number;
    shouldHideTTS: number;
    recommended: number;
    lectureRecommended: number;
    follow: number;
    secret: number;
    offline: number;
    lectureOffline: number;
    finishReading: number;
    hideReview: number;
    hideFriendMark: number;
    blacked: number;
    isAutoPay: number;
    availables: number;
    paid: number;
    isChapterPaid: number;
    showLectureButton: number;
    wxtts: number;
    star: number;
    ratingCount: number;
    ratingDetail: RatingDetail;
    // 推荐值
    newRating: number;
    // 点评总人数
    newRatingCount: number;
    // 点评信息
    newRatingDetail: NewRatingDetail;
    ranklist: Ranklist;
    // 版权信息
    copyrightInfo: CopyrightInfo;
    authorSeg: AuthorSeg[];
    translatorSeg: AuthorSeg[];
}
