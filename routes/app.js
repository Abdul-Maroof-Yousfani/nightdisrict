// All The Apis related to Mobile Applications are written here
import express from 'express';
import app from '../controllers/app.js';
import helpers from '../utils/helpers.js';

const router = express.Router();


// All Home Page Related 

router.post('/', helpers.verifyAuthToken , app.index)

// Ending Home Page Code



export default router;
