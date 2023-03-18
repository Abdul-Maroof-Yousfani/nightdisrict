import helper from '../utils/helpers.js'; 
import express from 'express';
import event from '../controllers/events.js';
const router = express.Router();


// Bar Profile


// Menus (Adding item to the Menu)

router.post("/" , event.store);






export default router;