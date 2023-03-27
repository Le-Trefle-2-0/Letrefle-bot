module.exports = async (messageContent, userID) => {
    Client.solar.ws.emit('send_message', {
        message: messageContent
    });
}