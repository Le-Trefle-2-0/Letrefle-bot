module.exports = async (Client, reaction, user) => {
    if (reaction.message.author.bot) {
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
                let reactions;

                switch (reaction.message.channel.type) {
                    case 'DM':
                        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
                        if (mainGuild) {
                            channel = await mainGuild.channels.fetch(ticket.channelID);
                            if (channel) {
                                msgToReact = channel.messages.cache.find(msg => msg.content === content);
                                if (msgToReact) {
                                    try {
                                        reactions = msgToReact.reactions.cache.find(react => react.emoji.name === reaction.emoji.name)
                                        if (reactions) {
                                            await reactions.users.remove()
                                        }
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
                                        reactions = msgToReact.reactions.cache.find(react => react.emoji.name === reaction.emoji.name)
                                        if (reactions) {
                                            await reactions.users.remove()
                                        }
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