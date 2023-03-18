import express from 'express';
const router = express.Router();
import postController from '../controllers/post.js';

router.post('/', postController.store);

export default router;