import { Article } from "./article.model.js";
import { ArticleRepository } from "./article.repository.js";

export class ArticleService {

    private repository = new ArticleRepository();

    getArticles(): Promise<Article[]> {
        return this.repository.findAll();
    }

    createArticle(article: Article): Promise<Article> {
        return this.repository.create(article);
    }

    updateArticle(id: string, article: Article): Promise<Article | null> {
        return this.repository.update(id, article);
    }

    deleteArticle(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}