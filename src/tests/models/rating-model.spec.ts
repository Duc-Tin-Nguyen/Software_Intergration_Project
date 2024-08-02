import mongoose from 'mongoose';
import ratingModel from '../../models/ratingModel';

beforeAll(async () => {
  const uri = 'mongodb://127.0.0.1:27017/test';
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Rating Model', () => {
  it('should create and save a rating successfully', async () => {
    const validRating = new ratingModel({
      movie_id: 1,
      email: 'testuser@example.com',
      rating: 4,
    });
    const savedRating = await validRating.save();

    expect(savedRating._id).toBeDefined();
    expect(savedRating.movie_id).toBe(1);
    expect(savedRating.email).toBe('testuser@example.com');
    expect(savedRating.rating).toBe(4);
  });

  it('should fail to create a rating without required fields', async () => {
    const invalidRating = new ratingModel({});

    let err;
    try {
      await invalidRating.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.movie_id).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  it('should fail to create a rating with invalid rating value', async () => {
    const invalidRating = new ratingModel({
      movie_id: 1,
      email: 'testuser@example.com',
      rating: 6,
    });

    let err;
    try {
      await invalidRating.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  it('should automatically set created_at field', async () => {
    const validRating = new ratingModel({
      movie_id: 1,
      email: 'testuser@example.com',
      rating: 4,
    });
    const savedRating = await validRating.save();

    expect(savedRating.created_at).toBeDefined();
  });
});
