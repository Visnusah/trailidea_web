import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const aiRouter = Router();
const aiController = new AIController();

// POST /api/v1/ai/suggest-post — Get 3 AI description suggestions for a post draft
aiRouter.post("/suggest-post", authorizedMiddleware, (req, res) => aiController.suggestPost(req, res));

// POST /api/v1/ai/suggest-comment — Get 3 short quick-reply comment chips
aiRouter.post("/suggest-comment", authorizedMiddleware, (req, res) => aiController.suggestComment(req, res));

// POST /api/v1/ai/chat — TrailIdea AI chatbot (hiking/trekking scoped)
aiRouter.post("/chat", authorizedMiddleware, (req, res) => aiController.chat(req, res));

export default aiRouter;
