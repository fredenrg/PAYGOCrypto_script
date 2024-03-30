export const parseEventMessage = (message) =>
  message.data ? JSON.parse(message.data) : message;
