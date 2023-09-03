interface Author {
    userVid: number;
    name: string;
    avatar: string;
    isFollowing: number;
    isFollower: number;
    isHide: number;
}

interface MpBook {
    bookId: string;
    format: string;
    version: number;
    soldout: number;
    type: number;
    paytype: number;
    cover: string;
    title: string;
    author: string;
}

interface MpInfo {
    originalId: string;
    doc_url: string;
    pic_url: string;
    title: string;
    content: string;
    mp_name: string;
    avatar: string;
    time: number;
    payType: number;
    inner: number;
}

interface InnerReview {
    reviewId: string;
    userVid: number;
    type: number;
    content: string;
    createTime: number;
    bookId: string;
    belongBookId: string;
    mpInfo: MpInfo;
    score: number;
    mpRank: number;
    topics: unknown[];
    isLike: number;
    isReposted: number;
    book: MpBook;
    author: Author;
}

interface OuterReview {
  reviewId: string;
  review: InnerReview;
  refCount?: number;
  likesCount?: number;
  repostCount?: number;
}

interface mpTypeJson {
    reviews: OuterReview[];
    clearAll: number;
    synckey: number;
}

export { mpTypeJson }
