const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');
const {readFile, writeFile, unlink} = require('fs');
const moment = require('moment');

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
                                    .setDescription(`🍀 | Votre salon d\'écoute a été fermé${(interaction.message.channel.type === 'DM') ? '' : ' par le bénévole écoutant'}. En cas de besoin, n\'hésitez pas à en réouvrir un !`)
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

                await readFile('./content/transcript.html', async (err, data) => {
                    if (err) throw err;

                    let htmlToAdd = [];

                    let msg = '<div class="message">\n' +
                        '  <div class="pdp">\n' +
                        '    <img src="{{PDP}}">\n' +
                        '  </div>\n' +
                        '  <div class="text">\n' +
                        '    <div class="username">\n' +
                        '      <h1>{{USERNAME}}</h1>\n' +
                        '    </div>\n' +
                        '\n' +
                        '    <div class="time">\n' +
                        '      <h1>{{TIME}}</h1>\n' +
                        '    </div>\n' +
                        '\n' +
                        '    <div class="content">\n' +
                        '      <h1>{{MSGCONTENT}}</h1>\n' +
                        '    </div>\n' +
                        '  </div>\n' +
                        '</div>';

                    let userMsg = '<div class="message user">\n' +
                        '  <div class="pdp">\n' +
                        '    <img src="https://media.discordapp.net/attachments/757897064754708560/883734125985529866/default-profile-picture-clipart-3.jpg">\n' +
                        '  </div>\n' +
                        '\n' +
                        '  <div class="text">\n' +
                        '    <div class="username">\n' +
                        '      <h1></h1>\n' +
                        '    </div>\n' +
                        '\n' +
                        '    <div class="time">\n' +
                        '      <h1>{{TIME}}</h1>\n' +
                        '    </div>\n' +
                        '\n' +
                        '    <div class="content">\n' +
                        '      <h1>{{CONTENT}}</h1>\n' +
                        '    </div>\n' +
                        '  </div>\n' +
                        '</div>';

                    let messagesArray = [];
                    await fetchMessages();

                    async function fetchMessages(before) {
                        let messages;
                        if (before) messages = await ticketChannel.messages.fetch({ limit: 100, before: before})
                        else messages = await ticketChannel.messages.fetch({ limit: 100 });

                        messages.forEach(message => {
                            messagesArray.push(message);
                        });

                        if (messages.size === 100) return fetchMessages(messagesArray[messagesArray.length-1].id);
                        return null;
                    }

                    for (let i = messagesArray.length - 2; i > 0; i--) {
                        let message = messagesArray[i]
                        if (message.author.id === Client.user.id) {
                            htmlToAdd.push(userMsg
                                .replace('{{TIME}}', moment(message.createdAt).format('DD/MM/YYYY - HH:mm'))
                                .replace('{{CONTENT}}', message.embeds[0].description)
                            );
                        } else {
                            htmlToAdd.push(msg
                                .replace('{{PDP}}', message.author.displayAvatarURL({ dynamic: false }))
                                .replace('{{USERNAME}}', message.author.username)
                                .replace('{{TIME}}', moment(message.createdAt).format('DD/MM/YYYY - HH:mm'))
                                .replace('{{MSGCONTENT}}', message.content)
                            );
                        }
                    }

                    let newHTML = data.toString('utf8')
                        .replace('{{CONTENT}}', htmlToAdd.join('\n\n'))
                        .replace('{{ID}}', ticket.ticketID);

                    await writeFile(`./tempSaves/transcript-${ticket.ticketID}.html`, newHTML, (err) => {
                        if (err) throw err;
                    });

                    let fileAttachment = new AttachmentBuilder(`./tempSaves/transcript-${ticket.ticketID}.html`, { name: `transcript-${ticket.ticketID}.html`});
                    let mainGuild = Client.guilds.cache.get(Client.settings.mainGuildID);
                    if (mainGuild) {
                        let transcriptChannel = await mainGuild.channels.fetch(Client.settings.transcriptChannelID);
                        if (transcriptChannel) {
                            try {
                                await transcriptChannel.send({ files: [fileAttachment]});
                            } catch (e) {
                                if (e) {
                                    throw e;
                                } else {
                                    ticketChannel.delete();
                                }
                            }
                        }
                    }

                    try {
                        unlink(`./tempSaves/transcript-${ticket.ticketID}.html`, (err) => {
                            if (err) throw err;
                        });
                    } catch (e) {
                        if (e) throw e
                    }
                });
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

        let historic = await Client.Historic.create({
            ticketID: ticket.ticketID,
        });
    }
}
