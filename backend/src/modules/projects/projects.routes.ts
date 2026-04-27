import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { checkSubscription } from "../../middleware/check-subscription.js";
import { validate } from "../../middleware/validate.js";
import { projectsController } from "./projects.controller.js";
import { updateWebhookSchema } from "./projects.schema.js";

const router = Router();

router.use(authenticate, checkSubscription);
router.get("/", async (req, res) => projectsController.list(req, res));
router.post("/default", async (req, res) => projectsController.ensureDefault(req, res));
router.patch("/:projectId/webhook", validate(updateWebhookSchema), async (req, res) => projectsController.updateWebhook(req, res));

export const projectsRoutes = router;
