// Importing with corrected relative paths assuming default exports
import messagesController from './controllers/messages.controller';
import MessageModel from './models/message.model';

jest.mock('./models/message.model'); // Adjust path as needed based on actual export

describe('Messages Controller', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (MessageModel as jest.MockedClass<typeof MessageModel>).mockClear();
  });

  it('should fetch all messages', async () => {
    const mockMessages = [{ id: 1, text: 'Test message' }];
    (MessageModel.find as jest.Mock).mockResolvedValue(mockMessages);
    const messages = await messagesController.getAllMessages();
    expect(messages).toEqual(mockMessages);
    expect(MessageModel.find).toHaveBeenCalledTimes(1);
  });

  it('should fetch a single message', async () => {
    const messageId = 1;
    const mockMessage = { id: messageId, text: 'Test message' };
    (MessageModel.findById as jest.Mock).mockResolvedValue(mockMessage);
    const message = await messagesController.getMessageById(messageId);
    expect(message).toEqual(mockMessage);
    expect(MessageModel.findById).toHaveBeenCalledWith(messageId);
  });

  it('should delete a message', async () => {
    const messageId = 1;
    (MessageModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ id: messageId });
    const result = await messagesController.deleteMessage(messageId);
    expect(result).toEqual({ id: messageId });
    expect(MessageModel.findByIdAndDelete).toHaveBeenCalledWith(messageId);
  });
});
