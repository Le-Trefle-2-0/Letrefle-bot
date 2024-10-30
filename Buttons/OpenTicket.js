const {ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ButtonStyle} = require('discord.js');

module.exports = async (Client, interaction, Ticket) => {

    async function genID() {
        let length = await Client.Historic.findAll();
        let currLength = await Client.Ticket.findAll();

        length = ((currLength.length+length.length)+1).toString();

        if (length.length < 5) {
            let missing = 5-length.length;

            function genMissing(len, str) {
                len--;
                if (!str) str = '0';
                else str = '0'+str

                if (len <= 0) return str;
                return genMissing(len, str);
            }

            let add = genMissing(missing)
            return add+length;
        }

        return length;
    }

    let hasTicket = await Client.Ticket.findOne({ where: { ownerId: interaction.user.id }});
    if (hasTicket) {
        interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setColor('cc0000')
                    .setDescription('❌ | Il semblerait que vous ayez déja un salon d\'écoute ouvert ! Veuillez le fermer avant d\'en ouvrir un nouveau.')
            ], ephemeral: true })
    } else {
        let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
        let parent = mainGuild.channels.cache.get(Client.settings.ticketCategoryID);

        // generate unique ID
        let id = await genID();

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('CloseTicket')
                    .setLabel('Fermer l\'écoute')
                    .setEmoji('⚠')
                    .setStyle(ButtonStyle.Danger)
            );

        try {
            // send DM confirmation
            await interaction.user.send({ embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setThumbnail('https://i.imgur.com/haHDKhq.png')
                        .setDescription('👋 | Bonsoir et bienvenue sur Le Trèfle 2.0\nTa demande d\'écoute a bien été prise en compte. Un bénévole écoutant te répondra sous 20 minutes, passé ce délai, nous t\'invitons à contacter un autre support d\'écoute disponible dans <#718250345951658064>.')
                        .setFooter({ text: `Pour toute réclamation, veuillez fournir l'identifiant unique : ${id}, correspondant à votre écoute.`})
                ], components: [row]});
        } catch (e) {
            if (e) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('cc0000')
                            .setDescription(`
                        ⚠️ | Il semblerait que vos messages privés soient fermés.
                        ⚠️ | Pour les ouvrir uniquement sur le serveur veuillez suivre la procédure :
                        
                        > 🖥️ | Sur ordinateur : vous pouvez faire un clic droit sur le serveur dans la liste, puis vous rendre dans les Paramètres de confidentialité, et autoriser les messages privés des membres du serveur
                        
                       > 📱 | Sur mobile : affichez la liste des salons, puis tout en haut cliquez sur le nom du serveur, et une fois sur le menu activez l'option Autoriser les messages privés`)
                            .setFooter({ text:'Si le problème persiste, merci de contacter un membre de l\'association.' })
                    ], ephemeral: true
                })
            }
        }

        let ticketChannel = await mainGuild.channels.create({
            name: id,
            topic: 'Salon d\'écoute | ID : '+id,
            parent,
            permissionOverwrites: [
                {
                    id: mainGuild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        });

        ticketChannel.permissionOverwrites.create(mainGuild.roles.everyone, {
            ViewChannel: false
        });

        await ticketChannel.permissionOverwrites.create(ticketChannel.guild.roles.cache.get(Client.settings.referentRoleID), {
            ViewChannel: true
        });

        let ticket = await Client.Ticket.create({
            ticketID: id,
            ownerID: interaction.user.id,
            channelID: ticketChannel.id,
            attributed: null,
        });

        // try {
        //     interaction.reply({ embeds: [
        //             new EmbedBuilder()
        //                 .setColor('GREEN')
        //                 .setDescription('✅ | Votre demande d\'écoute à bien été prise en compte, veuillez continuer par messages privés.')
        //         ], ephemeral: true});
        // } catch (e) {
        //     Client.functions.error(e);
        // }
        // TODO: check if interaction can be replied

        let available = await Client.available.findAll({ where: { occupied: false }});
        let options = [];

        for (let i of Object.values(available)) {
            let user = await Client.users.fetch(i.userID);
            let member = await interaction.guild.members.fetch(i.userID);
            if (user) {
                options.push({
                    label: member.nickname || user.username,
                    value: i.userID
                });
            }
        }

        let ticketMenuMessage = null;

        if (options.length < 1) {
            interaction.user.send({ embeds: [
                new EmbedBuilder()
                    .setColor('d36515')
                    .setDescription('Bonsoir, \n' +
                        '\n' +
                        'En raison d\'une forte affluence, l\'ensemble des bénévoles écoutants sont en écoute. \n' +
                        'En ce sens il y a de l\'attente. Dès qu\'un bénévole est disponible il prendra en charge ta demande. \n' +
                        '\n' +
                        'Merci pour ta compréhension 🙏')
                ]
            });

            ticketMenuMessage = await ticketChannel.send({ embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setDescription(':warning: | Tous les bénévoles sont actuellement occupés. Merci d\'utiliser la commande `/assigner` pour assigner un nouveau bénévole écoutant.')
                ], content: `<@&${Client.settings.referentRoleID}>`
            });
        } else {
            let attributeRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('addAvailable')
                        .setPlaceholder('Ajouter un bénévole')
                        .addOptions(options)
                );

            // send channel msg
            ticketMenuMessage = await ticketChannel.send({
                content: `<@&${Client.settings.referentRoleID}>`, embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setDescription('🍀 | Nouvelle demande d\'écoute. Veuillez attribuer un bénévole écoutant.')
                ], components: [attributeRow]
            });
        }

        await ticketMenuMessage.pin();
        ticketChannel.bulkDelete(1);
    }
}
