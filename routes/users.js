import helper from '../utils/helpers.js'; 
import express from 'express';
import userController from '../controllers/users.js';
import helpers from '../utils/helpers.js';
const router = express.Router();

router.get('/home', userController.home);
router.post('/', userController.register);
router.put('/',helpers.verifyAuthToken ,userController.update);
router.post('/login', userController.login);
router.post('/selectMembership' ,  helper.verifyAuthToken, userController.selectMembership);
router.put("/cardDetail" ,helper.verifyAuthToken, userController.cardDetail);

// change password functionalitiy

router.post("/forget-password" ,userController.forgetPassword);
router.post("/verify-otp" ,userController.verifyOtp);
router.post("/change-password" ,userController.changePassword);



// List oF DJ
router.get("/type/:type" , userController.userByType);







export default router;