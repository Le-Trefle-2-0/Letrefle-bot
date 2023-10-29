module.exports = async (Client, messageContent, userID) => {
    Client.Solar.ws.emit('bot_message', {
        messageContent: messageContent,
        userID: userID
    });
}