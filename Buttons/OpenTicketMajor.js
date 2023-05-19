const CreateTicket = require('../TicketUtility/CreateTicket');
const checkOpen = require('../TicketUtility/CheckOpen');
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = async (Client, interaction) => {
    await interaction.deferReply();

    await checkOpen(interaction.user.id).then(() => {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9BD2D2')
                    .setDescription('<:non:913706647187234856> | Il semblerait que tu aies déja une écoute d\'ouverte, essaye d\'abord de la terminer avant d\'en ouvrir une autre !')
            ],
            ephemeral: true
        });
    }).catch(async () => {
        let ticket = await CreateTicket(Client, interaction.user.id, false);

        let Buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('CloseTicket')
                .setLabel('Fermer l\'écoute')
                .setEmoji('⚠️')
                .setStyle(ButtonStyle.Danger)
        );
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('9BD2D2')
                    .setDescription(`<:letrefle:881678451608788993> | Bienvenue sur Le Trefle 2.0 ! Notre équipe de bénévoles écoutants va prendre en charge ta demande sous peu. En cas d'urgence merci de se référer aux numéros d'urgence dans <#718250345951658064>.\n\n<:bousole:913706646851702815> | Cette écoute est soumise á nos [conditions générales d\'utilisation](https://letrefle.org/).\n\n:warning: | Pour fermer l'écoute, appuyez sur le bouton ci-dessous.`)
                    .setFooter({ text: `Numéro d'écoute : ${ticket.id}` })
                    .setTimestamp()
            ],
            components: [Buttons]
        });
    });    
}