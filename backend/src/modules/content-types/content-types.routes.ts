import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { checkSubscription } from "../../middleware/check-subscription.js";
import { validate } from "../../middleware/validate.js";
import { contentTypesController } from "./content-types.controller.js";
import {
  contentTypeIdSchema,
  contentTypeListSchema,
  createContentTypeSchema,
  updateContentTypeSchema,
} from "./content-types.schema.js";

const router = Router();

router.use(authenticate, checkSubscription);
router.get("/", authorize("content:read"), validate(contentTypeListSchema), async (req, res) => contentTypesController.list(req, res));
router.get("/:id", authorize("content:read"), validate(contentTypeIdSchema), async (req, res) => contentTypesController.getOne(req, res));
router.post("/", authorize("settings:manage"), validate(createContentTypeSchema), async (req, res) => contentTypesController.create(req, res));
router.put("/:id", authorize("settings:manage"), validate(updateContentTypeSchema), async (req, res) => contentTypesController.update(req, res));
router.delete("/:id", authorize("settings:manage"), validate(contentTypeIdSchema), async (req, res) => contentTypesController.remove(req, res));

export const contentTypesRoutes = router;
