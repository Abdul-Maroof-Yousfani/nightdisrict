import helper from '../utils/helpers.js'; 
import express from 'express';
import event from '../controllers/events.js';
import admin from '../middlewares/admin.js';
import auth from '../utils/helpers.js';

const router = express.Router();


// Bar Profile


// Menus (Adding item to the Menu)

router.post("/" ,[auth.verifyAuthToken,admin], event.store);
router.get("/" ,[auth.verifyAuthToken,admin], event.index);
router.get("/:_id" , event.view);






export default router;