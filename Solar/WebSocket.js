const {io} = require('socket.io-client');

module.exports.connect = async (Client) => {
    const socket = await io(`ws://${process.env.SOLAR_WS}:3000`);

    Client.solar.ws = socket;

    // socket.emit('send_message', );

    socket.on('hello', (arg) => {
        Client.log.warning('WebSocket connected !');
    });

    socket.emit('bot_connect', {});

    socket.on('message', (arg) => {
        console.log(arg)
    });

    socket.onAny((event, ...args) => {
        Client.log.info(event, args);
    });
}