import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkSubscription } from "../../middleware/check-subscription.js";
import { apiRateLimit } from "../../middleware/security.js";
import { validate } from "../../middleware/validate.js";
import { entryController } from "./entry.controller.js";
import { createEntrySchema, entryIdSchema, listEntrySchema, updateEntrySchema } from "./entry.schema.js";

const router = Router();

router.use(authenticate, checkSubscription);
router.get("/", authorize("content:read"), validate(listEntrySchema), async (req, res) => entryController.list(req, res));
router.get("/:id", authorize("content:read"), validate(entryIdSchema), async (req, res) => entryController.getOne(req, res));
router.post("/", authorize("content:write"), validate(createEntrySchema), async (req, res) => entryController.create(req, res));
router.put("/:id", authorize("content:write"), validate(updateEntrySchema), async (req, res) => entryController.update(req, res));
router.delete("/:id", authorize("content:delete"), validate(entryIdSchema), async (req, res) => entryController.remove(req, res));
router.get("/:id/related", authorize("content:read"), validate(entryIdSchema), async (req, res) => entryController.related(req, res));
router.post("/:id/view", apiRateLimit, validate(entryIdSchema), async (req, res) => entryController.trackView(req, res));

export const entryRoutes = router;
