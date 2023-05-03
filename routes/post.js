import express from 'express';
const router = express.Router();
import postController from '../controllers/post.js';

router.post('/', postController.store);

router.get('/', postController.index);
router.get('/:_id', postController.view);

export default router;