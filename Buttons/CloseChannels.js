const {EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    let closing = await Client.functions.updateChannels(Client, false);

    if (closing) {
        interaction.reply({
            content: ':white_check_mark: | Les salons ont été fermés !', ephemeral: true
        })
    }
}