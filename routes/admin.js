import express from 'express';
import helpers from '../utils/helpers.js';
import category from '../controllers/admin/category.js';
import menu from '../controllers/admin/menu.js';
import hashtag from '../controllers/admin/hashtag.js';
import ticktype from '../controllers/admin/ticketType.js';
import subscriptiontype from '../controllers/subscriptiontype.js';
import pourtype from '../controllers/pourtype.js';
import inquiries from '../controllers/inquiries.js';
import users from '../controllers/users.js';
import bar from '../controllers/barowner/bar.js';
import admin from '../controllers/admin/admin.js';
const router = express.Router();


router.post("/category",category.store);
router.put("/category/:_id",category.update);
router.get("/category",category.index);
router.get("/parentCategory",category.parentCategory);
router.post("/category/items",category.getCategoryBasedItems);
router.get('/category/:_id',category.show)



router.post("/menu",helpers.verifyAuthToken,menu.store);
router.get("/menu/:_id",helpers.verifyAuthToken,menu.show);
router.put("/menu/:_id",helpers.verifyAuthToken,menu.update);
router.get("/menu",menu.index);


// hastags

router.post('/hashtag',hashtag.store);
router.get('/hashtag',hashtag.all);


// Ticket Types

router.post('/ticketType',ticktype.store);

// type of subscriptions

router.post('/subscriptiontype',subscriptiontype.store);



// Pour types


router.post('/pourtype',pourtype.store);
router.get('/pourtype',pourtype.index);


// inquiry


router.post('/inquiry',inquiries.store);



// user overview Dashboard


router.get('/user/activities',helpers.verifyAuthToken,users.activities);


// bar inquiries

router.get('/bar/inquiries',helpers.verifyAuthToken,admin.inquiries)
router.put('/bar/inquiries/:_id',helpers.verifyAuthToken,admin.updateInquiry)






export default router;
