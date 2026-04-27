import { Router } from "express";
import { publicController } from "./public.controller.js";

const router = Router();

router.get("/:projectId/content-types", async (req, res) => publicController.contentTypes(req, res));
router.get("/:projectId/entries/:contentType", async (req, res) => publicController.entries(req, res));
router.post("/:projectId/heartbeat", async (req, res) => publicController.heartbeat(req, res));

export const publicRoutes = router;
