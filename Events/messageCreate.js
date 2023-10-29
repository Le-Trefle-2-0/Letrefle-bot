const sendMessage = require('../TicketUtility/sendMessage');

module.exports = async (Client, message) => {
    if (message.author.bot) return;
    console.info(`[MESSAGE] ${message.author.tag}: ${message.content}`)
    if (message.channel.type == 1) {
        sendMessage(Client, message.content, message.author.id);
        console.info(`[DM] ${message.author.tag}: ${message.content}`);
    }
}