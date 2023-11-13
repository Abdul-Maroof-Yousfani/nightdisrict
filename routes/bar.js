import helper from '../utils/helpers.js'; 
import express from 'express';
import Bar from '../controllers/barowner/bar.js';
const router = express.Router();




// Bar Profile

router.get("/home" ,helper.verifyAuthToken, Bar.home);
router.delete("/destroy",helper.verifyAuthToken, Bar.destroy);
router.get('/home/app', helper.verifyAuthToken , Bar.app)
router.get('/home/web', helper.verifyAuthToken , Bar.web)



// Nightly Overview Report

router.get('/:id/report',  Bar.report)
router.get('/:id/pdf-report',  Bar.pdfReport)
// router.get('/generate/report/:id',  Bar.geberateReport)

// Reports related to bar ends here


router.get("/analytics" ,helper.verifyAuthToken, Bar.analytics);


router.put("/barProfile" ,helper.verifyAuthToken, Bar.barProfile);
router.put("/barInfo/:id" , helper.verifyAuthToken, Bar.barInfo);
// router.put("/barInfo/suspend/:id" , helper.verifyAuthToken, Bar.suspendRespond);

router.put("/detailInfo/:id" ,helper.verifyAuthToken, Bar.detailInfo);
router.put("/geometry" ,helper.verifyAuthToken, Bar.getBarGeometry);
router.put("/allInfo/:id" ,helper.verifyAuthToken, Bar.updateBarInfo);

router.post("/category" ,helper.verifyAuthToken, Bar.selectCategory);


router.post('/toggle',helper.verifyAuthToken, Bar.toggleUpdate);


// Menus (Adding item to the Menu)

router.post("/item" ,helper.verifyAuthToken, Bar.addItem)
router.put("/item/:id" ,helper.verifyAuthToken, Bar.update)
router.get("/item/:bar" , Bar.items)

// Ending Menu Code



// get orders based on Bar

router.get("/orders",helper.verifyAuthToken,Bar.orders);
router.get("/orders/:_id",helper.verifyAuthToken,Bar.view);

router.get("/orders/tips",helper.verifyAuthToken,Bar.tips);


router.get("/:id",helper.verifyAuthToken,Bar.show)

// get all events


router.get("/:id/events",helper.verifyAuthToken,Bar.events)

// get all Promotions


router.get("/:id/promotions",helper.verifyAuthToken,Bar.promotions)

// 

router.get("/:id/isBarHaveBartender", helper.verifyAuthToken, Bar.isBarHaveBartender)



export default router;