const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessageReactions
	], partials: [
		Partials.Channel,
		Partials.Message,
	]
});

client.commands = new Collection();
client.buttons = new Collection();
client.menus = new Collection();

module.exports.login = () => {
	client.login(process.env.DISCORD_TOKEN);

	return client;
};