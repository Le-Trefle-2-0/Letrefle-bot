module.exports = async (Client, type) => {
    if (!type.user.bot) {
        switch (type.inGuild()) {
            case true:
                let guildTicket = await Client.functions.findTicket(Client, null, type.channel.id);
                if (guildTicket) {
                    let user = Client.users.cache.get(guildTicket.ownerID);
                    if (user) {
                        try {
                            user.dmChannel.sendTyping();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
                break;

            case false:
                let ticket = await Client.functions.findTicket(Client, type.channel.recipient.id);
                if (ticket) {
                    let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
                    if (mainGuild) {
                        let channel = await mainGuild.channels.fetch(ticket.channelID);
                        if (channel) {
                            try {
                                channel.sendTyping();
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
                break;
        }
    }
}