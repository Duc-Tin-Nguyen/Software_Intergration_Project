import mongoose from 'mongoose';
import User from '../../models/userModel';

beforeAll(async () => {
  const uri = 'mongodb://127.0.0.1:27017/test'; // Replace with your MongoDB URI
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('should create and save a user successfully', async () => {
    const validUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe('testuser');
    expect(savedUser.email).toBe('testuser@example.com');
    expect(savedUser.password).toBe('password123');
  });

  it('should fail to create a user without required fields', async () => {
    const userWithoutRequiredField = new User({ username: 'testuser' });

    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail to create a user with a duplicate email', async () => {
    const user1 = new User({
      username: 'testuser1',
      email: 'duplicate@example.com',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      username: 'testuser2',
      email: 'duplicate@example.com',
      password: 'password456',
    });

    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
      console.error('Duplicate email error:', error); // Added logging for debugging
    }

    expect(err).toBeDefined();
    if (err) {
      console.log('Error details:', err); // Additional logging
      expect(err.code).toBe(11000); // Duplicate key error code
    }
  });

  it('should automatically set created_at and updated_at fields', async () => {
    const validUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();

    expect(savedUser.created_at).toBeDefined();
    expect(savedUser.updated_at).toBeDefined();
  });

  it('should reference messages correctly', async () => {
    const messageId = new mongoose.Types.ObjectId();
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      messages: [messageId],
    });
    const savedUser = await user.save();

    expect(savedUser.messages).toHaveLength(1);
    expect(savedUser.messages[0]).toEqual(messageId);
  });
});
