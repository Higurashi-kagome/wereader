import { Updated } from './Updated'
import { ThoughtsInAChap } from './ThoughtsInAChap'

// 获取标注数据
export interface ChapAndMarks {
    isCurrent: unknown;
    marks: Array<Updated | ThoughtsInAChap>;
    title: string;
    level: number;
    anchors?: {
        title: string;
        level: number;
        [key: string]: unknown;
    }[];
    bookId?: string;
    bookVersion?: number;
    chapterUid?: number;
    markText?: string;
    range?: string;
    style?: number;
    type?: number;
    createTime?: number;
    bookmarkId?: string;
}
