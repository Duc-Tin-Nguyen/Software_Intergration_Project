import request from 'supertest';
import express from 'express';
import validator from '../../middleware/validator';

jest.mock('../../middleware/winston');

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  // Adding a custom middleware to simulate an error for the test case
  if (req.headers['x-test-error']) {
    throw new Error('Test error');
  }
  next();
});
app.use(validator);

app.post('/test', (req, res) => {
  res.status(200).json(req.body);
});

describe('Validator Middleware', () => {
  it('should remove existing creation_date and add current date', async () => {
    const response = await request(app)
      .post('/test')
      .send({ creation_date: '2020-01-01', name: 'test' });

    const currentDate = new Date().toJSON().slice(0, 10);

    expect(response.status).toBe(200);
    expect(response.body.creation_date).toBe(currentDate);
    expect(response.body.name).toBe('test');
  });

  it('should convert empty string values to null', async () => {
    const response = await request(app)
      .post('/test')
      .send({ name: '' });

    const currentDate = new Date().toJSON().slice(0, 10);

    expect(response.status).toBe(200);
    expect(response.body.creation_date).toBe(currentDate);
    expect(response.body.name).toBeNull();
  });
});
