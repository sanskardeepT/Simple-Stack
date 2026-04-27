import { Router } from "express";
import { subscriptionController } from "./subscription.controller.js";

const router = Router();

router.post("/", async (req, res) => subscriptionController.webhook(req, res));

export const subscriptionWebhookRoutes = router;
