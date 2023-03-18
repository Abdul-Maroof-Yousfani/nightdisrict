import express from 'express';
import helpers from '../utils/helpers.js';
import category from '../controllers/admin/category.js';
import menu from '../controllers/admin/menu.js';
const router = express.Router();


router.post("/category",category.store);
router.get("/category",category.index);



router.post("/menu",menu.store);


export default router;
