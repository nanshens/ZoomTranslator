// This function generates the chatbody for your bot. This function is used when you type you / command
const axios = require('axios');
const { accountId } = require(".");

function generateChatBody(message, payload) {
  return {
    robot_jid: process.env.zoom_bot_jid,
    to_jid: payload.toJid,
    user_jid: payload.userJid,
    account_id: accountId,
    visible_to_user: true,
    // "is_markdown_support": true,
    content: {
      "head": {
        "text": message
      }
    },
  };
}
exports.generateChatBody = generateChatBody;

async function sendChat(chatBody, chatbotToken) {
  const response = await axios({
    url: 'https://api.zoom.us/v2/im/chat/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chatbotToken}`
    },
    data: chatBody
  });

  console.log('send chat response status', response.status);
  if (response.status >= 400) {
    throw new Error('Error sending chat');
  }
}
exports.sendChat = sendChat;
