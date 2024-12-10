const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const ms = require('ms');
const { where } = require('sequelize');
const crypto = require('crypto');

module.exports = {
    description: 'Consulter l\'historique d\'écoutes',
    options: [
        {
            name: 'type',
            type: 'string',
            desc: 'Type de recherche',
            required: true,
            // choices: [
            //     {
            //         name: 'Bénévole',
            //         value: 'volunteer'
            //     },
            //     {
            //         name: 'Utilisateur',
            //         value: 'user'
            //     },
            // ]
        },
        {
            name: 'pseudo',
            type: 'user',
            desc: 'Pseudo de l\'utilisateur',
            required: true
        },
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

        await interaction.deferReply({ephemeral: true});

        let type = interaction.options.getString('type');
        let historic;

        if (type == 'bénévole') {
            historic = await Client.Historic.findAll({
                where: {
                    attributed: user.id
                }
            });
        } else if (type == 'usager') {
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
        for (let i = 0; i < historic.length; i++) {
            string += `**Numéro d'écoute :** ${historic[i].ticketID}\n**Date :** <t:${Math.round(historic[i].openTimestamp/1000)}:d> (<t:${Math.round(historic[i].openTimestamp/1000)}:R>)\n**Durée de l'écoute :** ${ms(historic[i].duration, {long:true})}\n\n`;
        }

        console.log(string)

        if (string.length > 512) {
            let split = string.match(/[\s\s\S]{1,512}/g);
            let embeds = [];
            for (let i = 0; i < split.length; i++) {
                embeds.push(
                    new EmbedBuilder()
                        .setColor('9bd2d2')
                        .setTitle(`Historique d'écoute de ${user.displayName}`)
                        .setDescription(split[i])
                        .setFooter({text: `Page ${i+1}/${split.length}`})
                );
            }

            if (!Client.pages) Client.pages = {};

            interaction.editReply({
                embeds: [embeds[0]],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Page précédente')
                                .setStyle('2'),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Page suivante')
                                .setStyle('2')
                        )
                ]
            });

            let message = await interaction.fetchReply();
            
            Client.pages[message.id] = {embeds, page: 0};
        } else {
            let embeds = [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setTitle(`Historique d'écoute de ${user.displayName}`)
                    .setDescription(string)
            ];

            interaction.editReply({
                embeds
            });
        }
    }
}