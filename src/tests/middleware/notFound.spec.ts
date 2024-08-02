import request from 'supertest';
import express from 'express';
import notFound from '../../middleware/notFound';

const app = express();
app.use(notFound);

describe('Not Found Middleware', () => {
  it('should return 404 status and Not Found message for unknown routes', async () => {
    const response = await request(app).get('/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Not Found');
  });
});
