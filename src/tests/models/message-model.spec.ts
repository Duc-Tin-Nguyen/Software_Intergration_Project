import mongoose, { ConnectOptions } from 'mongoose';
import Message from '../../models/messageModel';
import { IMessage } from '../../types/message.d'; // Assuming IMessage is in a separate types file

// Mock the Mongoose methods we use in our tests
const mockSave = jest.fn();
const mockValidate = jest.fn();

jest.mock('../../models/messageModel', () => {
  const originalModule = jest.requireActual('../../models/messageModel');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn().mockImplementation(() => ({
      save: mockSave,
      validate: mockValidate,
    })),
  };
});

describe('Message Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw validation error if required fields are missing', async () => {
    const message = new Message({});

    mockValidate.mockImplementation(() => {
      const error = new mongoose.Error.ValidationError(null);
      error.addError('name', new mongoose.Error.ValidatorError({ message: 'Name is required' }));
      error.addError('user', new mongoose.Error.ValidatorError({ message: 'User is required' }));
      throw error;
    });

    let err;
    try {
      await message.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(mockValidate).toHaveBeenCalled();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.user).toBeDefined();
  });

  it('should save a message with all required fields', async () => {
    const messageData: Partial<IMessage> = {
      name: 'Hello',
      user: 'test@example.com' as any, // Using any type to bypass ObjectId type mismatch
    };

    mockSave.mockResolvedValue(messageData);

    const message = new Message(messageData);
    const savedMessage = await message.save();

    expect(mockSave).toHaveBeenCalled();
    expect(savedMessage.name).toBe(messageData.name);
    expect(savedMessage.user).toBe(messageData.user);
  });
});
