const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, LabelBuilder } = require('discord.js');

module.exports = async (Client, interaction) => {
    let categories = Client.settings.categories || [];

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

    modal.addComponents(
        new ActionRowBuilder().addComponents(prob),
        new ActionRowBuilder().addComponents(impressions),
        new ActionRowBuilder().addComponents(sup)
    );

    // Ajout du menu de sélection des catégories (avec option "Autre" systématique)
    let options = categories.map(cat => ({
        label: cat,
        value: cat
    }));

    // Ajout systématique de l'option "Autre" si elle n'est pas déjà présente
    if (!categories.includes("Autre")) {
        options.push({
            label: "Autre",
            value: "Autre"
        });
    }

    let selectMenu = new StringSelectMenuBuilder()
        .setCustomId('categories')
        .setPlaceholder('Choisissez une ou plusieurs catégories d\'écoute')
        .setMinValues(1)
        .setMaxValues(options.length)
        .addOptions(options);

    const categoriesLabel = new LabelBuilder()
        .setLabel("Catégories d'écoute")
        .setStringSelectMenuComponent(selectMenu);

    modal.addLabelComponents(categoriesLabel);

    await interaction.showModal(modal);
}
