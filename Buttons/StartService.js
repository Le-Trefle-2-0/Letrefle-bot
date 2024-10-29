const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let user = interaction.user;

    let userDB = await Client.available.findOne({ where: { userID: user.id }});
    if (userDB) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('⚠️ | Vous êtes déja disponible !')
            ], ephemeral: true
        });
    } else {
        await Client.available.create({ userID: user.id, occupied: false });
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription('🍀 | Vous êtes bien disponible !')
            ], ephemeral: true
        });

        Client.functions.updateAvailable(Client)
    }
}