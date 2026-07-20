import express from "express";
import path from "path";
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
import businessregistrationsRoutes from "./modules/businessRegistrations/businessregistrations.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.router.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import chatbotRoutes from "./modules/chatBot/chatbot.routes.js";
import campaignRoutes from "./modules/campaigns/campaign.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import popupRoutes from "./modules/popups/popup.routes.js";

const app = express();

app.use(corsConfig);

app.use(express.json());
if (process.env.USE_LOCAL_STORAGE === 'true') {
    app.use(express.static(path.join(process.cwd(), 'public')));
}


app.use(requestLogger);

app.use("/settings", settingsRoutes);
app.use("/cities", departamentRoutes);
app.use("/categories", categoryRoutes);
app.use("/businesses", businessRoutes);
app.use("/businesses-registrations", businessregistrationsRoutes)
app.use("/promotions", promotionRoutes);
app.use("/articles", articleRoutes);
app.use("/faqs", faqRoutes);
app.use("/users", userRoutes);
app.use('/pages', pageRoutes);
app.use("/dashboard", dashboardRouter);
app.use("/subscriptions", subscriptionRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/popups", popupRoutes);

app.use(errorMiddleware);

export default app;