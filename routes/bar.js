import helper from '../utils/helpers.js'; 
import express from 'express';
import Bar from '../controllers/barowner/bar.js';
const router = express.Router();


// Bar Profile

router.put("/barProfile" ,helper.verifyAuthToken, Bar.barProfile);
router.put("/barInfo/:id" , helper.verifyAuthToken, Bar.barInfo);
router.put("/detailInfo/:id" ,helper.verifyAuthToken, Bar.detailInfo);
router.put("/allInfo/:id" ,helper.verifyAuthToken, Bar.updateBarInfo);

router.post("/category" ,helper.verifyAuthToken, Bar.selectCategory);


// Menus (Adding item to the Menu)

router.post("/item" ,helper.verifyAuthToken, Bar.addItem)



// get orders based on Bar

router.get("/orders",helper.verifyAuthToken,Bar.orders);
router.get("/orders/:_id",helper.verifyAuthToken,Bar.view);

router.get("/orders/tips",helper.verifyAuthToken,Bar.tips);





export default router;