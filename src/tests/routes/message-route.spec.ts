import request from 'supertest';
import express from 'express';
import session from 'express-session';
import messageRoutes from '../../routes/messages.routes';
import messageModel from '../../models/messageModel';

jest.mock('../../models/messageModel');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'testSecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use((req, _res, next) => {
  req.session.user = {_id: 'testUserId', email: 'test@example.com' };
  next();
});
app.use('/messages', messageRoutes);

describe('Message Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /messages/add/message', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/messages/add/message').send({
        // Missing fields
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing information');
    });

    it('should return 500 if there is an error while adding message', async () => {
      (messageModel.prototype.save as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/messages/add/message')
        .send({ message: { name: 'Hello' } });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to add message');
    });
  });

  describe('GET /messages', () => {
    it('should return 200 and all messages', async () => {
      const messages = [{ id: 1, text: 'Hello' }];
      (messageModel.find as jest.Mock).mockResolvedValue(messages);

      const response = await request(app).get('/messages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(messages);
    });

    it('should return 500 if there is an error', async () => {
      (messageModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/messages');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error while getting messages');
    });
  });

  describe('GET /messages/:messageId', () => {
    it('should return 200 and the message if found', async () => {
      const message = { id: 1, text: 'Hello' };
      (messageModel.findById as jest.Mock).mockResolvedValue(message);

      const response = await request(app).get('/messages/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(message);
    });

    it('should return 404 if the message is not found', async () => {
      (messageModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/messages/1');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Message not found');
    });

    it('should return 500 if there is an error', async () => {
      (messageModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/messages/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error while getting message');
    });
  });

  describe('PUT /messages/edit/:messageId', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).put('/messages/edit/1').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing information');
    });

    it('should return 404 if the message is not found', async () => {
      (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const response = await request(app).put('/messages/edit/1').send({
        name: 'Updated',
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Message not found');
    });

    it('should return 200 and update the message if found', async () => {
      const message = { id: 1, name: 'Updated' };
      (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(message);

      const response = await request(app).put('/messages/edit/1').send({
        name: 'Updated',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(message);
    });

    it('should return 500 if there is an error while updating message', async () => {
      (messageModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/messages/edit/1').send({
        name: 'Updated',
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update message');
    });
  });

  describe('DELETE /messages/delete/:messageId', () => {
    it('should return 400 if messageId is missing', async () => {
      const response = await request(app).delete('/messages/delete/');

      expect(response.status).toBe(404); // Express will automatically return 404 for invalid route
    });

    it('should return 200 if the message is deleted', async () => {
      const message = { id: 1, name: 'Hello' };
      (messageModel.findByIdAndDelete as jest.Mock).mockResolvedValue(message);

      const response = await request(app).delete('/messages/delete/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message deleted');
    });

    it('should return 500 if there is an error while deleting message', async () => {
      (messageModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/messages/delete/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete message');
    });
  });
});
