import express, { Router } from 'express';
import {
  addMessage,
  getMessages,
  editMessage,
  deleteMessage,
  getMessageById
} from '../controllers/messages.controller';

const router: Router = express.Router();

router.post('/add/message', addMessage);
router.get('/', getMessages);
router.put('/edit/:messageId', editMessage);
router.delete('/delete/:messageId', deleteMessage);
router.get('/:messageId', getMessageById);

export default router;
