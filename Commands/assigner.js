const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');

module.exports = {
    description: 'Ajouter un nouveau bénévole à l\'écoute actuelle',
    options: [
        {
            name: 'bénévole',
            type: 'user',
            desc: 'Bénévole à ajouter à l\'écoute',
            required: true
        }
    ],
    run: async (Client, interaction) => {
        let user = interaction.options.getMember('bénévole');
        if (!user) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('db3226')
                    .setDescription(':x: | Merci de préciser un utilisateur à ajouter à l\'écoute !')
            ], ephemeral: true
        });

        Client.functions.assign(Client, user.id, interaction);
    }
}