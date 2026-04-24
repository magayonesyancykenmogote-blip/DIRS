import express from "express";
import { getResidents, getResidentById, checkBlotterRecord } from "../controllers/residentController.js";

const router = express.Router();

router.get("/", getResidents);
router.get("/:id", getResidentById);
router.post("/check-blotter", checkBlotterRecord);

export default router;