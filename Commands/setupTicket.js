const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
    description: 'Display the bot status',
    options: [],
    run: (Client, interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9bd2d2')
                    .setDescription(`Veuillez cliquer ci-dessous pour ouvrir une écoute`)
            ], components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('openTicket')
                            .setLabel('Ouvrir une écoute')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('👋')
                    )
            ]
        })
    }
}