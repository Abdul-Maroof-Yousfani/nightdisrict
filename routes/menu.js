import express from 'express';
const router = express.Router();
import helper from '../utils/helpers.js'; 
import menu from '../controllers/menu.js';

router.post('/createMenuCategory', helper.verifyAuthToken , menu.createMenuCat);
router.post('/createMenu', helper.verifyAuthToken , menu.createMenu);


// get reviews by menu : id

// router.post('reviews', helper.verifyAuthToken , menu.createMenu);



export default router;