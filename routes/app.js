// All The Apis related to Mobile Applications are written here
import express from 'express';
import app from '../controllers/app.js';
import helpers from '../utils/helpers.js';
import bar from '../controllers/barowner/bar.js';
import users from '../controllers/users.js';
import events from '../controllers/events.js';
import order from '../controllers/order.js';
import menu from '../controllers/menu.js';

const router = express.Router();


// All Home Page Related 

router.post('/', helpers.verifyAuthToken , app.index)

router.post('/mapView', helpers.verifyAuthToken , app.mapView)

// Ending Home Page Code

// Get Bar Details

router.get('/bar/:id',helpers.verifyAuthToken, bar.show)
router.post('/bar/menu',helpers.verifyAuthToken, bar.Menu)


// Update Profile


router.put("/user",helpers.verifyAuthToken , users.profile)



// near by events

router.post('/bars',helpers.verifyAuthToken, bar.nearby);

router.post('/events',helpers.verifyAuthToken, events.nearby);

router.get('/tickets', helpers.verifyAuthToken, events.tickets);


router.get('/payments', helpers.verifyAuthToken, order.payment);


// Events


// Reviews for bars,tickets


router.post('/review',helpers.verifyAuthToken,users.review);




// Setting Bar and Drinks As Favourite


router.post('/favourite',helpers.verifyAuthToken, users.favourite)
router.get('/favourite/bars',helpers.verifyAuthToken, users.favouritebars)
router.post('/favourite/drinks',helpers.verifyAuthToken, users.favouriteDrinks)
// router.get('/favourite/drinks',helpers.verifyAuthToken, users.favouriteDrinks)




// get menu and Reviews

router.post('/menu/review',helpers.verifyAuthToken, menu.getReviewById);






//  Add a review to the Drink /Events Promotions








export default router;
