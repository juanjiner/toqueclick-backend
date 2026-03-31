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
import { corsConfig } from "./config/cors.js";
import userRoutes from "./modules/users/user.routes.js";
import pageRoutes from "./modules/pages/page.routes.js";

const app = express();

app.use(corsConfig);

app.use(express.json());

app.use(requestLogger);

app.use("/settings", settingsRoutes);
app.use("/cities", departamentRoutes);
app.use("/categories", categoryRoutes);
app.use("/businesses", businessRoutes);
app.use("/promotions", promotionRoutes);
app.use("/articles", articleRoutes);
app.use("/faqs", faqRoutes);
app.use("/users", userRoutes);
app.use('/pages', pageRoutes);

app.use(errorMiddleware);

export default app;