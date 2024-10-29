const {EmbedBuilder} = require('discord.js')

module.exports = async (Client, oldMsg, newMsg) => {
    if (oldMsg.content !== newMsg.content) {
        let ticket;
        switch (newMsg.channel.type) {
            case 'DM':
                ticket = await Client.Ticket.findOne({ where: { ownerID: oldMsg.author.id }});
                break;

            default:
                ticket = await Client.Ticket.findOne({ where: { channelID: oldMsg.channel.id }});
        }

        if (ticket) {
            if (newMsg.channel.type === 'DM') {
                let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
                if (mainGuild) {
                    let channel = await mainGuild.channels.fetch(ticket.channelID);
                    if (channel) {
                        let msg = channel.messages.cache.find(mesg => mesg?.embeds[0]?.description === oldMsg.content);
                        if (msg) {
                            msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setAuthor({ name: 'Utilisateur', iconURL: 'https://cdn.discordapp.com/attachments/757897064754708560/883734125985529866/default-profile-picture-clipart-3.jpg' })
                                        .setDescription(`${newMsg.content} *(modifié)*`)
                                        .setTimestamp()
                                        .setColor('9bd2d2')
                                ]
                            })
                        }
                    }
                }
            } else {
                let user = Client.users.cache.get(ticket.ownerID);
                if (user) {
                    let channel = user.dmChannel;
                    if (channel) {
                        let msg = channel.messages.cache.find(mesg => mesg?.embeds[0]?.description === oldMsg.content);
                        if (msg) {
                            msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                        .setAuthor({ name: 'Bénévole écoutant', iconURL: 'https://cdn.discordapp.com/attachments/757897064754708560/883734125985529866/default-profile-picture-clipart-3.jpg' })
                                        .setDescription(`${newMsg.content} *(modifié)*`)
                                        .setFooter({ text: `Écoute ID : ${ticket.ticketID}` })
                                        .setColor('9bd2d2')
                                        .setTimestamp()
                                ]
                            })
                        }
                    }
                }
            }
        }
    }
}