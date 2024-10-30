const {ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType} = require('discord.js')

module.exports = async (Client, message) => {
    if (message.author.bot) return;

    if (Client.settings.setupMode && message.mentions.users.first().id === Client.user.id) {
        let msg = await message.channel.send('Configuration...');
        msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(`ChannelID: ${message.channel.id}\nMessageID: ${msg.id}`)
            ], content: null
        });
    }

    // handle DM messages redirection
    if (message.channel.type === ChannelType.DM) {
        let ticket = await Client.Ticket.findOne({ where: { ownerID: message.author.id } });

        if (ticket) {
            let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
            if (mainGuild) {
                let ticketChannel = await mainGuild.channels.fetch(ticket.channelID)
                if (ticketChannel) {
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: 'Utilisateur', iconURL: 'https://cdn.discordapp.com/attachments/757897064754708560/883734125985529866/default-profile-picture-clipart-3.jpg' })
                        .setDescription(message.content || 'Piece jointe :')
                        .setTimestamp()
                        .setColor('9bd2d2');

                    if (message.attachments.size >= 1) {
                        message.attachments.forEach(attachment => {
                            if (attachment.contentType.startsWith('image/')) {
                                embed.setImage(attachment.url);
                            } else return message.reply('Ce type de message n\'est pas supporté, merci d\'envoyer un message texte ou une image.')
                        })
                    }

                    if (message.reference) {
                        let replyMsg = await message.channel.messages.fetch(message.reference.messageId);
                        if (replyMsg) {
                            // check if replyMsg is partial and if yes fetch it in the channel with the id
                            if (replyMsg.partial) {
                                replyMsg = await message.channel.messages.fetch(message.reference.messageId);
                            }
                            let content = replyMsg?.embeds[0]?.description;
                            if (content) {
                                let msgToReply = ticketChannel.messages.cache.find(msg => msg.content === content);
                                if (msgToReply) {
                                    return msgToReply.reply({embeds: [embed]});
                                }
                            } else {
                                ticketChannel.send({ embeds: [embed]});
                            }
                        }
                    }

                    ticketChannel.send({ embeds: [ embed ]});
                }
            }
        } else {
            let embed = new EmbedBuilder()
                .setColor('9bd2d2')
                .setThumbnail(Client.user.avatarURL())

            let row = new ActionRowBuilder()

            let open = await Client.open.findOne();
            if (open.open) {
                row.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(false)
                        .setEmoji('👋')
                        .setLabel('Ouvrir une écoute')
                        .setCustomId('OpenTicket')
                );

                embed.setDescription(`Bienvenue sur Le Trèfle 2.0 !\n\nVous pouvez dès maintenant ouvrir une écoute à l'aide du bouton ci-dessous.\n`)
            } else {
                row.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                        .setEmoji('👋')
                        .setLabel('Ouvrir une écoute')
                        .setCustomId('OpenTicket')
                );
            }

            row.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setURL('https://letrefle.org')
                    .setLabel('Consulter notre site'),

                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setURL('https://discord.gg/letrefle')
                    .setLabel('Rejoindre notre serveur discord')
            );


        }
    }

    // handle server channel message redirection
    let ticket = await Client.Ticket.findOne({ where: { channelID: message.channel.id }});
    if (ticket) {
        let user = await Client.users.fetch(ticket.ownerID);
        if (user) {
            let embed = new EmbedBuilder()
                .setAuthor({ name: 'Bénévole écoutant', iconURL: 'https://cdn.discordapp.com/attachments/757897064754708560/883734125985529866/default-profile-picture-clipart-3.jpg'})
                .setDescription(message.content)
                .setFooter({ text: `Écoute ID : ${ticket.ticketID}` })
                .setColor('9bd2d2')
                .setTimestamp();

            if (message.attachments.size >= 1) {
                message.attachments.forEach(attachment => {
                    if (attachment.name.endsWith('.jpg') ||
                    attachment.name.endsWith('.jpeg') ||
                    attachment.name.endsWith('.png') ||
                    attachment.name.endsWith('.gif')) {
                        embed.setImage(attachment.url);
                    }
                })
            }

            if (message.reference) {
                let replyMsg = await message.channel.messages.fetch(message.reference.messageId);
                if (replyMsg) {
                    let content = replyMsg?.embeds[0]?.description;
                    if (content) {
                        let msgToReply = user.dmChannel.messages.cache.find(msg => msg.content === content);
                        if (msgToReply) {
                            try {
                                return await msgToReply.reply({embeds: [embed]});
                            } catch (e) {
                                message.react('❗');
                            }
                        }
                    } else {
                        try {
                            await user.dmChannel.send({ embeds: [embed]});
                        } catch (e) {
                            message.react('❗');
                        }
                    }
                }
            }

            try {
                await user.send({ embeds: [ embed ]});
            } catch (e) {
                message.react('❗');
            }
        
        }
    }
}
