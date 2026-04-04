import { Router } from "express";
import { analyticsRoutes } from "../modules/analytics/analytics.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { contentTypesRoutes } from "../modules/content-types/content-types.routes.js";
import { entryRoutes } from "../modules/entries/entry.routes.js";
import { mediaRoutes } from "../modules/media/media.routes.js";
import { usersRoutes } from "../modules/users/users.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/content-types", contentTypesRoutes);
router.use("/entries", entryRoutes);
router.use("/media", mediaRoutes);
router.use("/analytics", analyticsRoutes);

export const v1Routes = router;
