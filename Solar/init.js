module.exports = (Client) => {
    require('./WebSocket').connect(Client);
    require('./Login')();
    require('./RaiseSocket')();
    require('../TicketUtility/UpdateServiceOpening')(Client);

    Client.crypto = require('./encryptionService');
}