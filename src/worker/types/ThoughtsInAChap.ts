import { ThoughtReview } from './ThoughtReview'

// 获取想法

export interface ThoughtsInAChap {
    range: string;
    abstract: string;
    content: string;
    /**
     * 原始 review 对象，用于获取更多信息
     */
    review: ThoughtReview;
}
