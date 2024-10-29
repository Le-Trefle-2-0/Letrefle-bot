const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const bcrypt = require('bcrypt');

module.exports = async (Client, interaction) => {
    let user = await Client.users.fetch(interaction.values[0]);
    if (!user) return interaction.reply({
        embed: [
            new EmbedBuilder()
                .setColor('9nd2d2')
                .setDescription(':warning: | Cet utilisateur n\'a pas été trouvé, merci de séléctionner quelqu\'un d\'autre.')
        ], ephemeral: true
    });

    Client.functions.assign(Client, user.id, interaction);
}