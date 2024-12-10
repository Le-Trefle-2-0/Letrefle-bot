const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');
const {readFile, writeFile, unlink} = require('fs');
const moment = require('moment');
const crypto = require('crypto');
const transcript = require('discord-html-transcripts');

module.exports = async (Client, interaction) => {
    let ticket;
    if (!interaction.channel) return;
    if (interaction.channel.isDMBased()) ticket = await Client.functions.findTicket(Client, interaction.user.id, null);
    else ticket = await Client.functions.findTicket(Client, null, interaction.channel.id);

    if (ticket) {
        let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
        if (mainGuild) {
            let ticketChannel = await mainGuild.channels.cache.get(ticket.channelID);
            if (ticketChannel) {

                let row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                           .setCustomId('Transmission')
                           .setStyle(ButtonStyle.Primary)
                           .setLabel('Transmission')
                           .setEmoji('📝')
                    );
        
                ticketChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('9bd2d2')
                            .setDescription('🔒 | Cette écoute est maintenant fermée. Pour réaliser la transmission, merci d\'utiliser le bouton ci-dessous.')
                    ], components: [row]
                });

                let user = await Client.users.fetch(ticket.ownerID);
                if (user) {
                    try {
                        await user.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('9bd2d2')
                                    .setDescription(`🍀 | Votre salon d\'écoute a été fermé${(interaction.message.channel.type == 1) ? '' : ' par le bénévole écoutant'}. En cas de besoin, n\'hésitez pas à en réouvrir un !`)
                            ]
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }

                interaction.reply({ embeds: [
                        new EmbedBuilder()
                            .setColor('9bd2d2')
                            .setDescription('✅ | L\'écoute a bien été fermée !')
                ], ephemeral: true});

                const listenTranscript = await transcript.createTranscript(ticketChannel, {
                    limit: -1,
                    returnType: 'attachment',
                    filename: `transcript-${ticketChannel.name}.html`,
                    saveImages: true,
                    footerText: 'Transcript confidentiel - Le Trèfle 2.0 - Tout repartage contrevient au règlement intérieur de l\'association.',
                    poweredBy: false,
                });

                let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
                if (mainGuild) {
                    let transcriptChannel = await mainGuild.channels.fetch(Client.settings.transcriptChannelID);
                    if (transcriptChannel) {
                        try {
                            await transcriptChannel.send({ files: [listenTranscript]});
                        } catch (e) {
                            if (e) {
                                throw e;
                            } else {
                                ticketChannel.delete();
                            }
                        }
                    }
                }
            }
        }

        await ticket.destroy();

        if (ticket.attributed) {
            let occupied = false;
            let tickets = await Client.Ticket.findAll();
            for (let otherTicket of Object.values(tickets)) {
                if (otherTicket.attributed == ticket.attributed) occupied = true;
            }

            if (!occupied) {
                let userDB = await Client.available.findOne({ where: { userID: ticket.attributed }});
                if (userDB) {
                    userDB.update({
                        userID: userDB.userID,
                        occupied: false,
                    })
                }
            }
        }

        Client.functions.updateAvailable(Client);

        let hash = crypto.createHash('sha256').update(ticket.ownerID).digest('hex');

        let historic = await Client.Historic.create({
            ticketID: ticket.ticketID,
            ownerID: hash,
            openTimestamp: new Date(ticket.createdAt).getTime(),
            closeTimestamp: Date.now(),
            duration: Date.now() - ticket.createdAt,
            attributed: ticket.attributed,

        });
    }
}
