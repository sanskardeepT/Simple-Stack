import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authRateLimit } from "../../middleware/security.js";
import { validate } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", authRateLimit, validate(registerSchema), async (req, res) => authController.register(req, res));
router.post("/login", authRateLimit, validate(loginSchema), async (req, res) => authController.login(req, res));
router.post("/refresh", validate(refreshSchema), async (req, res) => authController.refresh(req, res));
router.post("/logout", authenticate, async (req, res) => authController.logout(req, res));
router.get("/me", authenticate, async (req, res) => authController.me(req, res));
router.patch("/change-password", authenticate, validate(changePasswordSchema), async (req, res) =>
  authController.changePassword(req, res),
);

export const authRoutes = router;
