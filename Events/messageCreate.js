const { ChannelType } = require('discord.js');

module.exports = async (Client, message) => {
    if (message.author.bot) return;

    if (message.channel.type === ChannelType.DM) {
        const Ticket = Client.Solar.tickets.cache.find(ticket => ticket.discordUserID === message.author.id);
        if (Ticket) {
            Client.Solar.socket.emit('sendMessage', {
                author: {
                    id: Client.Solar.user.id,
                    name: Client.Solar.user.displayUsername || Client.Solar.user.name,
                    image: '/logo.svg'
                },
                content: message.content,
                timestamp: Date.now(),
                channel: {
                    id: Ticket.channelId
                }
            });

            const save = await fetch(`${Client.settings.solar.url}/api/messages/${Ticket.channelId}`, {
                method: 'POST',
                body: JSON.stringify({
                    content: message.content,
                    timestamp: Date.now(),
                    channel: {
                        id: Ticket.channelId
                    },
                    author: {
                        id: Client.Solar.user.id,
                        name: Client.Solar.user.displayUsername || Client.Solar.user.name,
                        image: '/logo.svg'
                    },
                    token: process.env.SOLAR_TOKEN
                }),
            });
        }
    }
};
