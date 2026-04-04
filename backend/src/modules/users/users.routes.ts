import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { usersController } from "./users.controller.js";
import { listUsersSchema, updateUserSchema, userIdSchema } from "./users.schema.js";

const router = Router();

router.use(authenticate, authorize("users:manage"));
router.get("/", validate(listUsersSchema), async (req, res) => usersController.list(req, res));
router.get("/:id", validate(userIdSchema), async (req, res) => usersController.getOne(req, res));
router.patch("/:id", validate(updateUserSchema), async (req, res) => usersController.update(req, res));

export const usersRoutes = router;
