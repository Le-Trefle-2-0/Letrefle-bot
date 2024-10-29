module.exports = async (Client, reaction, user) => {
    if (reaction.message.author.bot) {
        // check if reaction,message is partial
        if (reaction.message.partial) {
            //fetch the message with it's id in the channel
            reaction.message = await reaction.message.channel.fetch(reaction.message.id);
        }
        let content = reaction.message?.embeds[0]?.description;
        if (content) {
            let ticket;
            switch (reaction.message.channel.type) {
                case 'DM':
                    ticket = await Client.Ticket.findOne({ where: { ownerID: user.id }});
                    break;

                default:
                    ticket = await Client.Ticket.findOne({ where: { channelID: reaction.message.channel.id }});
            }

            if (ticket) {
                let msgToReact;
                let channel;

                switch (reaction.message.channel.type) {
                    case 'DM':
                        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
                        if (mainGuild) {
                            channel = await mainGuild.channels.fetch(ticket.channelID);
                            if (channel) {
                                msgToReact = channel.messages.cache.find(msg => msg.content === content);
                                if (msgToReact) {
                                    try {
                                        msgToReact.react(reaction.emoji)
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                            }
                        }
                        break;

                    default:
                        let owner = await Client.users.fetch(ticket.ownerID);
                        if (owner) {
                            channel = owner.dmChannel;
                            if (channel) {
                                msgToReact = channel.messages.cache.find(msg => msg.content === content);
                                if (msgToReact) {
                                    try {
                                        msgToReact.react(reaction.emoji)
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                            }
                        }
                }
            }
        }
    }
}