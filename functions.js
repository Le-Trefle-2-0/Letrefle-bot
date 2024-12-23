
const {ActivityType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle} = require('discord.js')
const {post} = require('axios')

module.exports = {
    open: async (client, interaction) => {
        let openRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('OpenTicketSystem')
                    .setLabel('Commencer une permanence')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('CloseTicketSystem')
                    .setLabel('Fin de la permancence')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            )

        client.dashboard.message.edit({ embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🔓 | La permanence est actuellement ouverte !')
            ], components: [openRow], content: null});

        client.user.setPresence({
            status: 'online'
        });

        client.user.setActivity('la permanence ouverte !', { type: ActivityType.Watching });

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('OpenTicket')
                    .setLabel('Ouvrir une écoute')
                    .setEmoji('👋')
                    .setStyle(ButtonStyle.Success)
            );


        let mainGuild = await client.guilds.fetch(client.settings.mainGuildID);
        if (mainGuild) {
            let channel = await mainGuild.channels.fetch(client.settings.ticketOpening.channel);
            if (channel) {
                let message = await channel.messages.fetch(client.settings.ticketOpening.message);
                if (message) {
                    message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription('🔓 | La permanence est actuellement ouverte ! Ouvre un salon d\'écoute avec le bouton ci-dessous.')
                        ],
                        components: [row]
                    });
                }
            }

            let announcementChannel = await mainGuild.channels.fetch(client.settings.toCloseMessageChannel);
            if (announcementChannel) {
                announcementChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`<#${client.settings.ticketOpening.channel}>`)
                            .setImage('https://i.imgur.com/1ApEpoi.png')
                            .setColor('9bd2d2')
                    ]
                })
            }

            let voiceChannel = await mainGuild.channels.fetch(client.settings.voiceTicketChannelID);
            if (voiceChannel) {
                voiceChannel.permissionOverwrites.edit(mainGuild.id, {
                    ViewChannel: true,
                    Connect: true,
                });
            }
        }

        if (interaction) {
            interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('✅ | La permanence a bien été ouverte !')
                ], ephemeral: true})
        }

        let i = 0;

        await client.reOpen.findAll().then(olds => {
            olds.forEach(async old => {
                i++;
                await old.destroy();
            })
        });
    },

    close: async (client, timestamp, interaction) => {
        let closedRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('OpenTicketSystem')
                    .setLabel('Commencer une permanence')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),

                new ButtonBuilder()
                    .setCustomId('CloseTicketSystem')
                    .setLabel('Fin de la permancence')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
                    .setDisabled(true)
            );

        client.dashboard.message.edit({ embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🔒 | La permanence est actuellement fermée !')
            ], components: [closedRow], content: null});

        client.user.setPresence({
            status: 'dnd'
        });

        client.user.setActivity('la permanence fermée !', { type: ActivityType.Watching });

        let formatTimestamp = timestamp/1000

        let mainGuild = await client.guilds.fetch(client.settings.mainGuildID);
        if (mainGuild) {
            let channel = await mainGuild.channels.fetch(client.settings.ticketOpening.channel);
            if (channel) {
                let message = await channel.messages.fetch(client.settings.ticketOpening.message);
                if (message) {
                    message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription(`🔒 | La permanence est actuellement fermée ! La prochaine permanence aura lieu <t:${formatTimestamp}:R>

                            En cas de soucis urgent, n'hésite pas à te rendre dans <#718250345951658064>`)
                        ],
                        components: []
                    })
                }
            }

            let voiceChannel = await mainGuild.channels.fetch(client.settings.voiceTicketChannelID);
            if (voiceChannel) {
                voiceChannel.permissionOverwrites.edit(mainGuild.id, {
                    ViewChannel: false,
                    Connect: false,
                });
            }
        }

        let spectators = await client.spectators.findAll();
        for (let i in Object.keys(spectators)) {
            await spectators[i].destroy();
        }

        client.functions.updateAvailable(client);

        setTimeout(() => {
            client.functions.open(client);
        }, timestamp-Date.now());

        if (interaction) {
            interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('✅ | La permanence à bien été fermée !')
                ], ephemeral: true
            });
        }
    },

    updateAvailable: async (Client) => {
        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (mainGuild) {
            let channel = await mainGuild.channels.fetch(Client.settings.available.channelID);
            if (channel) {
                let msg = await channel.messages.fetch(Client.settings.available.messageID);
                if (msg) {
                    let text = '';

                    let users = await Client.available.findAll();
                    for (let i in Object.keys(users)) {
                        text += `\n${users[i].occupied ? '🔴' : '🟢'} <@${users[i].userID}>`;
                    }

                    if (text.length < 1) text = "Aucun bénévole disponible !";

                    let spectators = await Client.spectators.findAll()
                    let specTxt = '';
                    for (let i in Object.keys(spectators)) {
                        specTxt += `\n:eyes: <@${spectators[i].userID}>`
                    }
                    if (specTxt.length > 1) text += `\n${specTxt}`

                    let row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('StartService')
                                .setEmoji('👋')
                                .setLabel('Rejoindre la permanence')
                                .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                                .setCustomId('StopService')
                                .setLabel('Quitter la permanence')
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId('Spectate')
                                .setLabel('Mode spectateur')
                                .setStyle(ButtonStyle.Secondary)
                        )
                    msg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription(`Bénévoles disponibles :\n${text}`)
                        ], components: [row], content: null
                    })
                }
            }
        }
    },

    updateChannelsMessage: async (Client) => {
        let guild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (guild) {
            let channel = await guild.channels.fetch(Client.settings.channels.channelID);
            if (channel) {
                let message = await channel.messages.fetch(Client.settings.channels.messageID);
                if (message) {
                    let opened = await Client.open.findAll()
                    opened = opened[0];
                    if (!opened) opened = {
                        open: true
                    }

                    let row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('OpenChannels')
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('🔓')
                                .setLabel('Ouvrir les salons')
                                .setDisabled(opened.open),

                            new ButtonBuilder()
                                .setCustomId('CloseChannels')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🔒')
                                .setLabel('Fermer les salons')
                                .setDisabled(!opened.open)
                        );

                    message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription(opened.open ? '🔓 | Salons ouverts' : '🔒 | Salons fermés')
                        ], components: [row]
                    });
                }
            }
        }
    },

    updateChannels: async (Client, open) => {
        let guild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (guild) {
            let opened = await Client.open.findAll()

            for (let i of opened) {
                // if (i.open === open) return false;
                await i.destroy();
            }

            await Client.open.create({
                open: open
            });

            for (let i of Object.keys(Client.settings.toClose)) {
                let role = await guild.roles.fetch(i);
                if (role) {
                    for (let id of Client.settings.toClose[i]) {
                        let channel = await guild.channels.fetch(id);
                        if (channel) {
			    if (channel.isTextBased()) {
                                channel.permissionOverwrites.edit(role, {
                                    SendMessages: open,
                                });
                            } else if (channel.isVoiceBased()) {
                                channel.permissionOverwrites.edit(role, {
                                    Connect: open,
                                });
                            }
                        }
                    }
                }
            }

            let openEmbed = new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('<:onn:895691557817180191>  __**Bonjour à toutes et à tous, les canaux vocaux et textuels sont ouverts**__.  <:onn:895691557817180191>\n' +
                    ':sunny: *Nous comptons sur vous pour avoir des échanges et des propos corrects.* :sunny:')
                .setImage('https://cdn.discordapp.com/attachments/718248830428119121/895901124404584488/Le_petit_bonjour_du_matin.png');

            let closeEmbed = new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('__**<:off:895691615593705512>  Fermeture des canaux textuels et vocaux. <:off:895691615593705512>**\n' +
                    '*L\'équipe vous souhaites une très belle nuit. A demain.*__\n' +
                    '--\n' +
                    ':last_quarter_moon_with_face:**__POURQUOI ON FERME LES CANAUX LA NUIT__** :\n *En tant qu\'association reconnue d\'action sociale, nous avons la responsabilité de ce qui se passe sur notre discord. Quand l\'association sera plus développée, nous pourrons vous proposer des horaires un peu plus tardifs dans des canaux publics, mais il est aussi question de vous préserver au niveau sommeil. Oui, vous pouvez aller sur un autre serveur, mais nous nous devons de ne pas participer à cela.*:first_quarter_moon_with_face:\n' +
                    '\n' +
                    'PS: Si cette nuit tu ne vas pas bien n\'hésites pas à te rendre ici : <#718250345951658064>')
                .setImage('https://cdn.discordapp.com/attachments/718248830428119121/895777777905729577/Le_bonsoir-1.png')

            let mainChannel = await guild.channels.fetch(Client.settings.toCloseMessageChannel);
            if (mainChannel) {
                let msg = await mainChannel.send({
                    embeds: [
                        (open ? openEmbed : closeEmbed),
                    ]
                });

                if (!open) {
                    for (let i of Client.settings.toCloseEmojis) {
                        let emoji = await Client.emojis.cache.get(i);
                        if (emoji) {
                            msg.react(emoji);
                        }
                    }
                }
            }

            Client.functions.updateChannelsMessage(Client);

            return true;
        } else return false;
    },

    assign: async (Client, userID, interaction) => {
        let ticket = await Client.Ticket.findOne({where: {channelID: interaction.channelId}});
        if (!ticket) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':warning: | Cette commande n\'est utilisable que dans un salon d\'écoute')
            ]
        });

        let userDB = await Client.available.findOne({ where: { userID: userID}});
        if (!userDB) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':warning: | Cet utilisateur ne semble pas être dans la permanence.')
            ], ephemeral: true
        });

        await userDB.update({
            userID: userID,
            occupied: true,
        });

        let oldUserDB = await Client.available.findOne({ where: { userID: ticket.attributed}});
        if (oldUserDB) {
            oldUserDB.update({
                userID: ticket.attributed,
                occupied: false,
            });
        }
        
        Client.functions.updateAvailable(Client);

        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (mainGuild) {
            let channel = await mainGuild.channels.fetch(ticket.channelID);
            if (channel) {
                let newUser = await Client.users.fetch(userID);

                if (!ticket.attributed) {
                    if (newUser) {
                        let spectators = await Client.spectators.findAll();
                        for (let i in Object.keys(spectators)) {
                            let user = await Client.users.fetch(spectators[i].userID);
                            if (user) {
                                channel.permissionOverwrites.create(user, {
                                    ViewChannel: true,
                                    SendMessages: false
                                })
                            }
                        }

                        channel.permissionOverwrites.create(newUser, {
                            ViewChannel: true,
                            SendMessages: true,
                        });

                        let row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('CloseTicket')
                                    .setLabel('Fermer l\'écoute')
                                    .setEmoji('⚠')
                                    .setStyle(ButtonStyle.Danger),

                                new ButtonBuilder()
                                    .setCustomId('ReportTicket')
                                    .setLabel('Vigilance')
                                    .setEmoji('🔴')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(false),

                                new ButtonBuilder()
                                    .setCustomId('AnonyLift')
                                    .setLabel('Levée d\'identifiant')
                                    .setEmoji('🆔')
                                    .setStyle(ButtonStyle.Secondary)
                            )

                        // await channel.bulkDelete(99);
                        if (interaction.message) {
                            interaction.message.edit({
                                content: `<@${userID}>`,
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('9bd2d2')
                                        .setDescription('💬 | Cette écoute est maintenant attribuée, tout message envoyé dans ce salon sera transmis à l\'utilisateur.')
                                ], components: [row]
                            });
                        } else {
                            let messages = await interaction.channel.messages.fetchPinned();
                            if (messages) {
                                messages.first().edit({
                                    content: `<@${userID}>`,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor('9bd2d2')
                                            .setDescription('💬 | Cette écoute est maintenant attribuée, tout message envoyé dans ce salon sera transmis à l\'utilisateur.')
                                    ], components: [row]
                                });
                            }
                        }

                        let ping = await interaction.channel.send(`<@${userID}>`);
                        ping.delete();

                        interaction.reply({
                            content: 'L\'utilisateur est bien assigné !',
                            ephemeral: true
                        });

                        let attributedTimestamp = Date.now();
                        if (ticket.attributedAt) attributedTimestamp = ticket.attributedAt;

                        await ticket.update({
                            ticketID: ticket.ticketID,
                            ownerID: ticket.ownerID,
                            channelID: ticket.channelID,
                            attributed: userID,
                            attributedAt: attributedTimestamp
                        });
                    }
                } else {
                    let oldUser = await Client.users.fetch(ticket.attributed);
                    let occupied = false;

                    let attributedTimestamp = Date.now();
                    if (ticket.attributedAt) attributedTimestamp = ticket.attributedAt;

                    await ticket.update({
                        ticketID: ticket.ticketID,
                        ownerID: ticket.ownerID,
                        channelID: ticket.channelID,
                        attributed: userID,
                        attributedAt: attributedTimestamp
                    });

                    let tickets = await Client.Ticket.findAll();
                    for (let ticket of Object.values(tickets)) {
                        if (ticket.attributed === oldUser.id) {
                            occupied = true
                        }
                    }

                    if (!occupied) {
                        let userDB = await Client.available.findOne({ where: { userID: oldUser.id }});
                        if (userDB) {
                            await userDB.update({
                                userID: userDB.userID,
                                occupied: false,
                            })
                        }
                    }

                    channel.permissionOverwrites.delete(oldUser);
                    let spectate = await Client.spectators.findOne({where: {userID: oldUser.id}});
                    if (spectate) {
                        channel.permissionOverwrites.create(oldUser, {
                            ViewChannel: true,
                            SendMessages: false,
                        })
                    }
                    if (newUser) {
                        channel.permissionOverwrites.create(newUser, {
                            ViewChannel: true,
                            SendMessages: true,
                        });

                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('9bd2d2')
                                    .setDescription(`:white_check_mark: | \`${interaction.user.tag}\` a ajouté \`${newUser.tag}\` à l'écoute.`)
                            ]
                        })
                    }
                }

            }
        }

        Client.functions.updateAvailable(Client);
    },

    unassign: async (Client, userID, interaction) => {
        let ticket = await Client.Ticket.findOne({where: {channelID: interaction.channelId}});
        if (!ticket) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':warning: | Cette commande n\'est utilisable que dans un salon d\'écoute')
            ]
        });

        let userDB = await Client.available.findOne({ where: { userID: userID}});
        if (!userDB) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(':warning: | Cet utilisateur ne semble pas être dans la permanence.')
            ], ephemeral: true
        });

        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (mainGuild) {
            let channel = await mainGuild.channels.fetch(ticket.channelID);
            if (channel) {
                let user = await Client.users.fetch(userID);
                if (user) {
                    channel.permissionOverwrites.delete(user);
                    await ticket.update({
                        ticketID: ticket.ticketID,
                        ownerID: ticket.ownerID,
                        channelID: ticket.channelID,
                        attributed: null,
                    });

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('9bd2d2')
                                .setDescription(`:white_check_mark: | \`${interaction.user.tag}\` a désassigné ${user.tag} de l'écoute.`)
                        ]
                    });
                }
            }
        }

        Client.functions.updateAvailable(Client);
    },

    findTicket: async (Client, userID, channelID) => {
        if (userID) {
            let ticket = await Client.Ticket.findOne({where: {ownerID: userID}});
            if (ticket) return ticket;
        } else if (channelID) {
            let ticket = await Client.Ticket.findOne({where: {channelID: channelID}});
            if (ticket) return ticket;
        }
    },

    error: async (Client, error) => {
        console.log(`${Date.now()} - Critical error :`);
        if (!error) return;
        console.log(error);

        if (error.length >= 1500) {
            let url = await post('https://www.toptal.com/developers/hastebin/documents', error);

            error = url.data;
        } else {
            error = `\`\`\`js${error}\`\`\``
        }

        let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
        if (mainGuild) {
            let logsChannel = await mainGuild.channels.fetch(Client.settings.logsChannelID);
            if (logsChannel) {
                logsChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('9bd2d2')
                            .setTitle(':warning: | Unhandled critical error :')
                            .setDescription(error)
                    ]
                })
            }
        }
    },

    loadDM: async (Client) => {
        let tickets = await Client.Ticket.findAll();
        tickets.forEach(async ticket => {
            let user = await Client.users.fetch(ticket.ownerID);
            if (user) {
                await user.createDM();
            }
        });
    }
}
