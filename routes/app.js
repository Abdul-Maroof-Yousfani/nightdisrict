// All The Apis related to Mobile Applications are written here
import express from 'express';
import app from '../controllers/app.js';
import helpers from '../utils/helpers.js';
import bar from '../controllers/barowner/bar.js';
import users from '../controllers/users.js';
import events from '../controllers/events.js';

const router = express.Router();


// All Home Page Related 

router.post('/', helpers.verifyAuthToken , app.index)
router.post('/mapView', helpers.verifyAuthToken , app.mapView)

// Ending Home Page Code

// Get Bar Details

router.get('/bar/:id',helpers.verifyAuthToken, bar.show)


// Update Profile


router.put("/user",helpers.verifyAuthToken , users.profile)



// near by events

router.post('/events',helpers.verifyAuthToken, events.nearby);



export default router;
