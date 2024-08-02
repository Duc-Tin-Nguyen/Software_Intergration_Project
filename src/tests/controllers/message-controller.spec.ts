import { Request, Response } from 'express';
import messageModel from '../../models/messageModel';
import {
  getMessages,
  getMessageById,
  addMessage,
  editMessage,
  deleteMessage,
} from '../../controllers/messages.controller';

// Mock messageModel
jest.mock('../../models/messageModel');

describe('Message Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = {
      status,
      json,
    };
    req = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return 200 and all messages', async () => {
      const messages = [{ id: 1, text: 'Hello' }];
      (messageModel.find as jest.Mock).mockResolvedValue(messages);

      await getMessages(req as Request, res as Response);

      expect(messageModel.find).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(messages);
    });

    it('should return 500 if there is an error', async () => {
      (messageModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getMessages(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Error while getting messages' });
    });
  });

  describe('getMessageById', () => {
    it('should return 200 and the message if found', async () => {
      const message = { id: 1, text: 'Hello' };
      (messageModel.findById as jest.Mock).mockResolvedValue(message);

      req = { params: { messageId: '1' } };

      await getMessageById(req as Request, res as Response);

      expect(messageModel.findById).toHaveBeenCalledWith('1');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(message);
    });

    it('should return 404 if the message is not found', async () => {
      (messageModel.findById as jest.Mock).mockResolvedValue(null);

      req = { params: { messageId: '1' } };

      await getMessageById(req as Request, res as Response);

      expect(messageModel.findById).toHaveBeenCalledWith('1');
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Message not found' });
    });

    it('should return 500 if there is an error', async () => {
      (messageModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { params: { messageId: '1' } };

      await getMessageById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Error while getting message' });
    });
  });

  describe('addMessage', () => {
    it('should return 400 if required fields are missing', async () => {
      req = { body: {} };

      await addMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ error: 'Missing information' });
    });

    it('should return 500 if the user is not authenticated', async () => {
      req = {
        body: { message: { name: 'Hello' } },
        session: {},
      };

      await addMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should return 500 if there is an error while adding message', async () => {
      (messageModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = {
        body: { message: { name: 'Hello' } },
        session: { user: { email: 'test@example.com' } },
      };

      await addMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Failed to add message' });
    });
  });

  describe('editMessage', () => {
    it('should return 400 if required fields are missing', async () => {
      req = { body: {}, params: { messageId: '1' } };

      await editMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ error: 'Missing information' });
    });

    it('should return 404 if the message is not found', async () => {
      (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      req = { body: { name: 'Updated' }, params: { messageId: '1' } };

      await editMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Message not found' });
    });

    it('should return 200 and update the message if found', async () => {
      const message = { id: 1, name: 'Updated' };
      (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(message);

      req = { body: { name: 'Updated' }, params: { messageId: '1' } };

      await editMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(message);
    });

    it('should return 500 if there is an error while updating message', async () => {
      (messageModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { body: { name: 'Updated' }, params: { messageId: '1' } };

      await editMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Failed to update message' });
    });
  });

  describe('deleteMessage', () => {
    it('should return 400 if messageId is missing', async () => {
      req = { params: {} };

      await deleteMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ error: 'Missing information' });
    });

    it('should return 200 if the message is deleted', async () => {
      req = { params: { messageId: '1' } };

      await deleteMessage(req as Request, res as Response);

      expect(messageModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ message: 'Message deleted' });
    });

    it('should return 500 if there is an error while deleting message', async () => {
      (messageModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { params: { messageId: '1' } };

      await deleteMessage(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ error: 'Failed to delete message' });
    });
  });
});
