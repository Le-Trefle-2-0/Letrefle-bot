const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, AttachmentBuilder, MessageFlags} = require('discord.js');
const ms = require('ms');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { time } = require('console');
const fs = require('fs');

module.exports = {
    description: 'Consulter les informations d\'une écoute',
    options: [
        {
            name: 'id',
            type: 'string',
            desc: 'Numéro de l\'écoute',
            required: true
        },
    ],
    run: async (Client, interaction) => {
        let id = interaction.options.getString('id');
        if (id.length < 5) {
            let missing = 5-id.length;

            function genMissing(len, str) {
                len--;
                if (!str) str = '0';
                else str = '0'+str

                if (len <= 0) return str;
                return genMissing(len, str);
            }

            let add = genMissing(missing)
            id = add+id;
        }
        let ticket = await Client.Historic.findOne({
            where: {
                ticketID: id
            }
        });

        let message = await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (!ticket) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(':x: | Aucune écoute n\'a été trouvée.')
                ]
            });
        }

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Transcript')
                    .setLabel('Transcript')
                    .setStyle(1)
                    .setEmoji('📝')
            );

        let categoriesList = 'Aucune';
        if (ticket.categories) {
            try {
                let categoriesArray = JSON.parse(ticket.categories);
                if (Array.isArray(categoriesArray) && categoriesArray.length > 0) {
                    categoriesList = categoriesArray.join(', ');
                } else if (typeof ticket.categories === 'string' && ticket.categories.length > 0) {
                    // Fallback pour les anciennes données si jamais
                    categoriesList = ticket.categories;
                }
            } catch (e) {
                // Fallback si ce n'est pas du JSON
                categoriesList = ticket.categories;
            }
        }

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(`🔍 | Informations de l'écoute ${id}

                        Attibution: ${ticket.attributed ? `<@${ticket.attributed}>` : 'Non attribué'}
                        Durée: ${ms(ticket.duration, { long: true })}
                        Catégories: ${categoriesList}
                        Date de création: <t:${Math.round(ticket.openTimestamp/1000)}:d> (<t:${Math.round(ticket.openTimestamp/1000)}:R>)`)
            ], components: [row]
        });

        message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000
        }).on('collect', async i => {
            if (!fs.existsSync(`./Transcripts/${ticket.ticketID}.html`)) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('db3226')
                            .setDescription(':x: | Aucun transcript n\'a été trouvé.')
                    ], flags: [MessageFlags.Ephemeral]
                });
            }
            let transcript = new AttachmentBuilder(`./Transcripts/${ticket.ticketID}.html`);
            if (!transcript) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('db3226')
                            .setDescription(':x: | Aucun transcript n\'a été trouvé.')
                    ], flags: [MessageFlags.Ephemeral]
                });
            }

            i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setDescription('📝 | Voici le transcript de l\'écoute.')
                ],
                files: [transcript], flags: [MessageFlags.Ephemeral]
            });
        });
    }
}