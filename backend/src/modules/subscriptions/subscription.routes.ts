import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { subscriptionController } from "./subscription.controller.js";
import { applyCouponSchema, emptySchema, verifyPaymentSchema } from "./subscription.schema.js";

const router = Router();

router.use(authenticate);
router.get("/status", async (req, res) => subscriptionController.status(req, res));
router.post("/coupon", validate(applyCouponSchema), async (req, res) => subscriptionController.applyCoupon(req, res));
router.post("/checkout", validate(emptySchema), async (req, res) => subscriptionController.checkout(req, res));
router.post("/verify-payment", validate(verifyPaymentSchema), async (req, res) => subscriptionController.verifyPayment(req, res));

export const subscriptionRoutes = router;
