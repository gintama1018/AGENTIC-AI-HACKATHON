import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getReturns, 
  getReturnById, 
  importReturns, 
  createSingleReturn, 
  seedDemoData, 
  deleteReturn, 
  clearAllReturns 
} from '../controllers/returnsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

const router = express.Router();

router.get('/', authMiddleware, getReturns);
router.get('/:id', authMiddleware, getReturnById);
router.post('/import', authMiddleware, upload.single('file'), importReturns);
router.post('/single', authMiddleware, createSingleReturn);
router.post('/seed-demo', authMiddleware, seedDemoData);
router.delete('/clear-all', authMiddleware, clearAllReturns);
router.delete('/:id', authMiddleware, deleteReturn);

export default router;
