const CloseTicket = require('../TicketUtility/CloseTicket');
const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    await CloseTicket(Client, interaction.user.id).catch((err) => {
        if (err) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('DB4437')
                    .setDescription(':warning: | Ohh, une erreur est survenue... Si le problème persiste, merci de contacter un administrateur.')
            ],
            ephemeral: true
        });
    });
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('9bd2d2')
                .setDescription('<:letrefle:881678451608788993> | Ton écoute a bien été fermée !')
        ],
    });
}