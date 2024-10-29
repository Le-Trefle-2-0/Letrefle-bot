module.exports = async (Client, message) => {
    let ticket;
    switch (message.channel.type) {
        case 'DM':
            ticket = await Client.Ticket.findOne({ where: { ownerID: message.author.id }});
            break;

        default:
            ticket = await Client.Ticket.findOne({ where: { channelID: message.channel.id }});
    }

    if (ticket) {
        if (message.channel.type === 'DM') {
            let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
            if (mainGuild) {
                let channel = await mainGuild.channels.fetch(ticket.channelID);
                if (channel) {
                    let msg = channel.messages.cache.find(msg => msg?.embeds[0]?.description === message.content);
                    if (msg) {
                        msg.delete();
                    }
                }
            }
        } else {
            let user = Client.users.cache.get(ticket.ownerID);
            if (user) {
                let channel = user.dmChannel;
                if (channel) {
                    let msg = channel.messages.cache.find(msg => msg?.embeds[0]?.description === message.content);
                    if (msg) {
                        msg.delete()
                    }
                }
            }
        }
    }
}