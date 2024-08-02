import mongoose from 'mongoose';
import MessageModel from './models/message.model';

describe('Message Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  it('should save a message', async () => {
    const messageData = { text: 'Hello World' };
    const message = new MessageModel(messageData);
    const savedMessage = await message.save();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.text).toBe(messageData.text);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});
