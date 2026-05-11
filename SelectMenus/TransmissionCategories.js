const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (Client, interaction) => {
    const customId = interaction.customId;
    const selectedCategories = interaction.values;
    
    // On stocke temporairement les catégories dans Client pour les récupérer dans le Modal
    if (!Client.tempData) Client.tempData = {};
    Client.tempData[interaction.user.id] = {
        categories: selectedCategories
    };

    let modal = new ModalBuilder()
        .setCustomId("Transmission")
        .setTitle("Transmission");

    let prob = new TextInputBuilder()
        .setCustomId("problematic")
        .setLabel('Problématique de l\'écoute :')
        .setStyle(TextInputStyle.Paragraph);

    let impressions = new TextInputBuilder()
        .setCustomId("impressions")
        .setLabel('Observations générales :')
        .setStyle(TextInputStyle.Paragraph);

    let sup = new TextInputBuilder()
        .setCustomId('suplement')
        .setLabel('Informations supplémentaires (facultatif) :')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    let probRow = new ActionRowBuilder().addComponents(prob);
    let impressionsRow = new ActionRowBuilder().addComponents(impressions);
    let supRow = new ActionRowBuilder().addComponents(sup);

    modal.addComponents(probRow, impressionsRow, supRow);

    await interaction.showModal(modal);
}
