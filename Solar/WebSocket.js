const {io} = require('socket.io-client');

module.exports.connect = async (Client) => {
    const socket = await io(`ws://localhost:3001`);

    Client.solar.ws = socket;

    // socket.emit('send_message', );

    socket.on('hello', (arg) => {
        Client.log.warning('WebSocket connected !');
    });

    socket.emit('is_bot', {});

    socket.on('message', (arg) => {
        console.log(arg)
    });

    socket.onAny((event, ...args) => {
        Client.log.info(event, args);
    });
}