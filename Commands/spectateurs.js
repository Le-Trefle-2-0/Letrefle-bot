const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');

module.exports = {
    description: 'Effacer tous les spectateurs',
    options: [],
    run: async (Client, interaction) => {
	let spectate = await Client.spectators.findAll();
	for (let i in Object.keys(spectate)) {
	   let toRemove = spectate[i];
	   await toRemove.destroy();
	}

	Client.functions.updateAvailable(Client);

	interaction.reply({
	   embeds: [
		new EmbedBuilder()
		   .setColor('9bd2d2')
		   .setDescription(':white_check_mark: | Tous les spectateurs ont été effacés !')
	   ],
	   ephemeral: true
	});
    }
}
