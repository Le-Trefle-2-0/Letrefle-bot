const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');

module.exports = {
    description: 'Enlève un bénévole de l\'écoute',
    options: [
        {
            name: 'bénévole',
            type: 'user',
            desc: 'bénévole à enlever de l\'écoute',
            required: true
        }
    ],
    run: async (Client, interaction) => {
        let user = interaction.options.getMember('bénévole');
        if (!user) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(':x: | Merci de préciser le bénévole à enlever de l\'écoute.')
            ], ephemeral: true
        });

        Client.functions.unassign(Client, user.id, interaction);
    }
}