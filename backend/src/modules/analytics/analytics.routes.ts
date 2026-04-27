import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkSubscription } from "../../middleware/check-subscription.js";
import { apiRateLimit, globalRateLimit } from "../../middleware/security.js";
import { analyticsController } from "./analytics.controller.js";

const router = Router();

router.get("/dashboard", authenticate, checkSubscription, authorize("analytics:read"), async (req, res) => analyticsController.dashboard(req, res));
router.get("/activity", authenticate, checkSubscription, authorize("analytics:read"), async (req, res) => analyticsController.activity(req, res));
router.get("/trending", globalRateLimit, async (req, res) => analyticsController.trending(req, res));
router.post("/event", apiRateLimit, async (req, res) => analyticsController.event(req, res));

export const analyticsRoutes = router;
