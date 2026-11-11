import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import supportRoutes from "./support.routes.js";
import ticketRoutes from "./ticket.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.get("/dashboard", authenticate, dashboardController.summary);
router.get("/categories", authenticate, categoryController.list);
router.use("/tickets", authenticate, ticketRoutes);
router.use("/support", authenticate, supportRoutes);

export default router;
