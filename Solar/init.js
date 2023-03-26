module.exports = (Client) => {
    require('./WebSocket').connect(Client);
    require('./Login')();
    require('./RaiseSocket')();
}