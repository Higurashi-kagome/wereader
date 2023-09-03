import { Author } from './Author'
import { ThoughtReplyUser } from './ThoughtReplyUser'

export interface ThoughtComment {
    content: string;
    reviewId: string;
    commentId: string;
    userVid: number;
    createTime: number;
    author: Author;
    toCommentId?: string;
    toUserVid?: number;
    replyUser?: ThoughtReplyUser;
}
