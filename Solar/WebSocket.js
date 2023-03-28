const {io} = require('socket.io-client');
const {EmbedBuilder} = require('discord.js');

module.exports.connect = async (Client) => {
    const socket = await io(`ws://${process.env.SOLAR_WS}:${process.env.SOLAR_WS_PORT}`);

    Client.solar.ws = socket;

    // socket.emit('send_message', );

    socket.on('hello', (arg) => {
        Client.log.info('WebSocket connected !');
    });

    socket.emit('bot_connect', {});

    socket.on('message', (arg) => {
        console.log(arg)
    });

    socket.on('bot_message', async (message) => {
        Client.log.info(`[MESSAGE] ${message.userID}: ${message.content}`)
        let user = await Client.users.fetch(message.userID);
        if (user) user.send({
            embeds: [ 
                new EmbedBuilder()
                    .setAuthor({ name: 'Bénévole Écoutant' })
                    .setDescription(message.content)
                    .setTimestamp()
                    .setColor('#8CBF86')
            ]
        });
    });

    socket.onAny((event, ...args) => {
        // Client.log.info(event, args);
    });
}