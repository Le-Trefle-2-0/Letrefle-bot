const { Client, Collection } = require('discord.js');

const client = new Client({ intents: 28786 });

client.commands = new Collection();
client.buttons = new Collection();
client.menus = new Collection();
client.solar = {}

module.exports.login = () => {
	client.login(process.env.SECRET_TOKEN);

	return client;
};