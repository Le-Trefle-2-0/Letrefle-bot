const { triggerAsyncId } = require('async_hooks');
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const checkOpen = require('../TicketUtility/CheckOpen');

module.exports = async (Client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    let Buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('OpenTicketMinor')
            .setLabel('Mineur')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('OpenTicketMajor')
            .setLabel('Majeur')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('OpenTicketNoAge')
            .setLabel('Continuer sans indiquer')
            .setStyle(ButtonStyle.Secondary)
    )
    
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
        try {
            await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor('9BD2D2')
                    .setDescription('<:letrefle:881678451608788993> | Bienvenue sur Le Trefle 2.0 ! Pour des raisons statistiques et pratiques, tu as la possibilité d\'indiquer ton age.\n\n<:bousole:913706646851702815> | Cette écoute est soumise á nos [conditions générales d\'utilisation](https://letrefle.org/).')
                ],
                components: [Buttons]
            });
        } catch (e) {
            if (e) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('E0301E')
                            .setDescription(`
                        ⚠️ | Il semblerait que vos messages privés soient fermés.
                        ⚠️ | Pour les ouvrir uniquement sur le serveur veuillez suivre la procédure :
                        
                        > 🖥️ | Sur ordinateur : vous pouvez faire un clic droit sur le serveur dans la liste, puis vous rendre dans les Paramètres de confidentialité, et autoriser les messages privés des membres du serveur
                        
                       > 📱 | Sur mobile : affichez la liste des salons, puis tout en haut cliquez sur le nom du serveur, et une fois sur le menu activez l'option Autoriser les messages privés`)
                            .setFooter({ text: 'Si le problème perciste, merci de contacter un modérateur.' })
                    ], ephemeral: true
                })
            }
        }
    
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor('9BD2D2')
                .setDescription('<:oui:913706647132712981> | La demande d\'écoute á bien été prise en charge. Veuillez continuer par messages privés.')
            ],
            ephemeral: true
        });
    });    
}