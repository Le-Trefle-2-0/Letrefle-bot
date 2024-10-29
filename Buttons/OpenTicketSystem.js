const {ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require('discord.js');

module.exports = async (Client, interaction) => {
    Client.functions.open(Client, interaction);
}