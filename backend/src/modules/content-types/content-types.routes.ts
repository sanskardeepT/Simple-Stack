import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { contentTypesController } from "./content-types.controller.js";
import {
  contentTypeIdSchema,
  contentTypeListSchema,
  createContentTypeSchema,
  updateContentTypeSchema,
} from "./content-types.schema.js";

const router = Router();

router.get("/", authenticate, authorize("content:read"), validate(contentTypeListSchema), async (req, res) => contentTypesController.list(req, res));
router.get("/:id", authenticate, authorize("content:read"), validate(contentTypeIdSchema), async (req, res) => contentTypesController.getOne(req, res));
router.post("/", authenticate, authorize("settings:manage"), validate(createContentTypeSchema), async (req, res) => contentTypesController.create(req, res));
router.put("/:id", authenticate, authorize("settings:manage"), validate(updateContentTypeSchema), async (req, res) => contentTypesController.update(req, res));
router.delete("/:id", authenticate, authorize("settings:manage"), validate(contentTypeIdSchema), async (req, res) => contentTypesController.remove(req, res));

export const contentTypesRoutes = router;
