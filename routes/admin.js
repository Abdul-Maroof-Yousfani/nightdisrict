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
import page from '../controllers/page.js';
import multer from 'multer';
import excel from 'exceljs';

const storage = multer.memoryStorage();
const upload = multer({ storage });



const router = express.Router();
router.get('/users/barOwnersDetails', helpers.verifyAuthToken, admin.barOwnersDetails)
router.post("/category",category.store);
router.put("/category/:_id",category.update);
router.get("/category2/:id",category.getSingleCategory);
router.get("/category",category.index);
router.get("/parentCategory",category.parentCategory);
router.get("/parentCategory2",category.parentCategory2);
router.post("/category/items",category.getCategoryBasedItems);
router.get('/category/:_id',category.show);


// new flow design
router.get('/parent-categories',)


// Import Menu From Excel

router.post('/import/products',menu.importProduct)



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
router.get('/bar/details/:id',helpers.verifyAuthToken,bar.getBarStats);


//user activities


router.get('/users/getUserActivities',helpers.verifyAuthToken,admin.getUserActivities)
router.put('/users/blockOrUnBlockUser',helpers.verifyAuthToken,admin.blockOrUnBlockUser)


// Pages

router.post('/page',page.store);
router.get('/page/:slug',page.find);



// Super Admin Home Page

router.get('/home', admin.home);
router.get('/analytics', admin.analytics);

// HomePage Ends


// All bars Related Data

router.get('/bars', bar.all);
router.get('/bar/:id/analytics', bar.analyticsByBarId);
router.put('/bar/:id/suspend', bar.suspendRespond);

// Ending Bar Related Data


// All user Related Data

router.get('/users', users.all);
router.get('/users/:id', users.activities);
router.get('/users/detail/:id', users.details);


// router.get('/menus', menu.all );




// get admin User Activities
// router.get('/home', admin.home);



// 


// Ending HomePage Here

export default router;