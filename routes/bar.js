import helper from '../utils/helpers.js'; 
import express from 'express';
import Bar from '../controllers/barowner/bar.js';
const router = express.Router();


// Bar Profile

router.put("/barProfile" ,helper.verifyAuthToken, Bar.barProfile);
router.put("/barInfo/:id" , helper.verifyAuthToken, Bar.barInfo);
router.put("/detailInfo/:id" ,helper.verifyAuthToken, Bar.detailInfo);
router.put("/allInfo/:id" ,helper.verifyAuthToken, Bar.updateBarInfo);


// Menus (Adding item to the Menu)

router.put("/item" ,helper.verifyAuthToken, Bar.addItem)



export default router;