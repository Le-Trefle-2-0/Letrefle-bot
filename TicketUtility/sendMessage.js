module.exports = async (Client, messageContent, userID) => {
    Client.solar.ws.emit('bot_message', {
        messageContent: messageContent,
        userID: userID
    });
}