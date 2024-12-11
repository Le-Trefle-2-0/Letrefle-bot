const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const ms = require('ms');
const { Op } = require('sequelize');
const crypto = require('crypto');

module.exports = {
    description: 'Consulter l\'historique d\'écoutes',
    options: [
        {
            name: 'type',
            type: 'string',
            desc: 'Type de recherche',
            required: true,
            choices: [
                {
                    name: 'Bénévole',
                    value: 'volunteer'
                },
                {
                    name: 'Utilisateur',
                    value: 'user'
                },
            ]
        },
        {
            name: 'pseudo',
            type: 'user',
            desc: 'Pseudo de l\'utilisateur',
            required: true
        },
        {
            name: 'page',
            type: 'string',
            desc: 'Page à afficher',
            required: false
        }
    ],
    run: async (Client, interaction) => {
        let user = interaction.options.getMember('pseudo');
        if (!user) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(':x: | Merci de préciser un utilisateur Discord.')
            ], ephemeral: true
        });

        await interaction.deferReply({ ephemeral: true });

        let type = interaction.options.getString('type');
        let historic;

        if (type == 'volunteer') {
            historic = await Client.Historic.findAll({
                where: {
                    attributed: user.id
                }
            });
        } else if (type == 'user') {
            historic = await Client.Historic.findAll({
                where: {
                    ownerID: crypto.createHash('sha256').update(user.id).digest('hex')
                }
            });

        } else {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(':x: | Merci de préciser un type de recherche valide.')
                ]
            });
        }

        if (historic.length == 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('db3226')
                        .setDescription(':x: | Aucune écoute n\'a été trouvée.')
                ]
            });
        }

        historic = historic.sort((a, b) => b.openTimestamp - a.openTimestamp);

        let string = '';
        let array = [];
        for (let i = 0; i < historic.length; i++) {
            let newString = `**Numéro d'écoute :** ${historic[i].ticketID}\n**Date :** <t:${Math.round(historic[i].openTimestamp/1000)}:d> (<t:${Math.round(historic[i].openTimestamp/1000)}:R>)\n**Durée de l'écoute :** ${ms(historic[i].duration, {long:true})}\n\n`;
            if (string.length+newString.length > 512) {
                array.push(string);
                string = newString;
            } else {
                string += newString;
            }
        }

        if (array.length > 1) {
            let embeds = [];
            for (let i = 0; i < array.length; i++) {
                embeds.push(
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setTitle(`Historique d'écoute ${user ? `de ${user.displayName}` : 'sur 12h'}`)
                        .setDescription(array[i])
                        .setFooter({text: `Page ${i+1}/${array.length}`})
                );
            }

            if (!Client.pages) Client.pages = {};
            let page = parseInt(interaction.options.getString('page'))-1 || 0;

            interaction.editReply({
                embeds: [embeds[page]],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('PreviousPage')
                                .setLabel('Page précédente')
                                .setStyle('2'),
                            new ButtonBuilder()
                                .setCustomId('NextPage')
                                .setLabel('Page suivante')
                                .setStyle('2')
                        )
                ]
            });

            let message = await interaction.fetchReply();
            
            Client.pages[message.id] = { pages: embeds, pageNumber: page};

            setTimeout(() => {
                delete Client.pages[message.id];
            }, 300000);
        } else {
            let embeds = [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle(`Historique d'écoute ${user ? `de ${user.displayName}` : 'sur 12h'}`)
                    .setDescription(string)
            ];

            interaction.editReply({
                embeds
            });
        }
    }
}