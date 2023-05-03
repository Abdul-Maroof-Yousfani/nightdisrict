import express from "express";
const router = express.Router();
import webController from "../controllers/web/webController.js";

router.post('/nearby', webController.nearby);




export default router;