import helper from '../utils/helpers.js'; 
import express from 'express';
import event from '../controllers/events.js';
import admin from '../middlewares/admin.js';
import auth from '../utils/helpers.js';

const router = express.Router();


// Bar Profile


// Menus (Adding item to the Menu)

router.post("/" ,[auth.verifyAuthToken], event.store);
router.put("/:id" ,[auth.verifyAuthToken], event.update);
router.get("/" ,[auth.verifyAuthToken], event.index);
router.get("/app" ,[auth.verifyAuthToken], event.all);
router.get("/:_id" , event.view);
router.get("/single/:_id" , event.single);






export default router;