import express from "express";
import departamentRoutes from "./modules/cities/city.routes.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import promotionRoutes from "./modules/promotions/promotion.routes.js";
import articleRoutes from "./modules/articles/article.routes.js";
import businessRoutes from "./modules/businesses/business.routes.js";
import faqRoutes from "./modules/faqs/faq.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use("/api/settings", settingsRoutes);
app.use("/api/cities", departamentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/faqs", faqRoutes);

app.use(errorMiddleware);

export default app;