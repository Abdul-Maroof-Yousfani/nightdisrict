import express from 'express';
const router = express.Router();
import promotion from '../controllers/promotion.js';
import helpers from '../utils/helpers.js';


router.get('/all', helpers.verifyAuthToken, promotion.getPromotions);

router.post('/', helpers.verifyAuthToken,  promotion.store);
router.get('/', helpers.verifyAuthToken, promotion.index);
router.get('/:_id', helpers.verifyAuthToken, promotion.show);






export default router;