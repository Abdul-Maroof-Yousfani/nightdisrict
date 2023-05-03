import express from 'express';
const router = express.Router();
import role from '../controllers/role.js';

router.post('/createrole', role.createRole);
router.get('/', role.index);



export default router;