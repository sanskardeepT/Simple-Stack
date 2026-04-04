import multer from "multer";
import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { mediaController } from "./media.controller.js";
import { mediaCreateSchema, mediaIdSchema, mediaListSchema } from "./media.schema.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", authenticate, authorize("content:read"), validate(mediaListSchema), async (req, res) => mediaController.list(req, res));
router.get("/:id", authenticate, authorize("content:read"), validate(mediaIdSchema), async (req, res) => mediaController.getOne(req, res));
router.post("/", authenticate, authorize("media:upload"), upload.single("file"), validate(mediaCreateSchema), async (req, res) => mediaController.create(req, res));
router.delete("/:id", authenticate, authorize("media:delete"), validate(mediaIdSchema), async (req, res) => mediaController.remove(req, res));

export const mediaRoutes = router;
