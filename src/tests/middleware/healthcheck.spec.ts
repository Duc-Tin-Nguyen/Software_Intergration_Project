import request from 'supertest';
import express from 'express';
import healthcheckRouter from '../../middleware/healthCheck';

const app = express();
app.use(healthcheckRouter);

describe('Health Check Route', () => {
  it('should return 200 status and a success message', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('All up and running !!');
  });
});
