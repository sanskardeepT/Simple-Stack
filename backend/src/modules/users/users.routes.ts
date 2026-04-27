import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { usersController } from "./users.controller.js";
import { exportUsersSchema, listUsersSchema, subscriptionActionSchema, updateUserSchema, userIdSchema } from "./users.schema.js";

const router = Router();

router.use(authenticate, authorize("users:manage"));
router.get("/dashboard", async (req, res) => usersController.dashboard(req, res));
router.get("/export.csv", validate(exportUsersSchema), async (req, res) => usersController.exportCsv(req, res));
router.get("/", validate(listUsersSchema), async (req, res) => usersController.list(req, res));
router.get("/:id", validate(userIdSchema), async (req, res) => usersController.getOne(req, res));
router.patch("/:id", validate(updateUserSchema), async (req, res) => usersController.update(req, res));
router.post("/:id/subscription/activate", validate(subscriptionActionSchema), async (req, res) =>
  usersController.activateSubscription(req, res),
);
router.post("/:id/subscription/deactivate", validate(userIdSchema), async (req, res) =>
  usersController.deactivateSubscription(req, res),
);
router.delete("/:id", validate(userIdSchema), async (req, res) => usersController.delete(req, res));

export const usersRoutes = router;
