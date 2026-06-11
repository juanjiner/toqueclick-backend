export interface Article {
    id?: string;
    title: string;
    imageUrl: string;
    categoryId: string;
    author: string;
    date: Date;
    content: string;
    tags: string;
    published: boolean;
    audioUrl?: string | null;
    videoUrl?: string | null;
}