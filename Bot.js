const { Client, Collection } = require('discord.js');

const client = new Client({ intents: 28786 });

client.commands = new Collection();
client.buttons = new Collection();
client.menus = new Collection();

module.exports.login = () => {
	client.login(process.env.DISCORD_TOKEN);

	return client;
};