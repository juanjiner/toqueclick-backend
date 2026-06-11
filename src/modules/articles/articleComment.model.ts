export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ArticleComment {
    id?: string;
    articleId: string;
    authorName: string;
    authorEmail: string;
    content: string;
    status?: CommentStatus;
    deviceId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
