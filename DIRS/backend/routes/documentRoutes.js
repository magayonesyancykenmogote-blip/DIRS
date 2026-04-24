import express from "express";
import { getDocuments, createDocument } from "../controllers/documentController.js";
const router = express.Router();

router.get("/", getDocuments);
router.post("/", createDocument);

export default router;
