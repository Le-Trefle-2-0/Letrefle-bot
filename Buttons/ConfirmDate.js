<<<<<<< HEAD
const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
=======
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
>>>>>>> master
const moment = require("moment");

module.exports = async (Client, interaction) => {
  let data = Client.dateSelector.data;

  let reopenTimestamp = new Date(
    parseInt(data.year.value),
    parseInt(data.month.value) - 1,
    parseInt(data.day.value),
    parseInt(data.hour.value),
    parseInt(data.minute.value)
  ).valueOf();
  let formatTimestamp = Math.round(reopenTimestamp / 1000);
  let currTimestamp = Date.now();

  if (currTimestamp > reopenTimestamp)
    return interaction.reply({
      embeds: [
<<<<<<< HEAD
        new EmbedBuilder()
=======
        new MessageEmbed()
>>>>>>> master
          .setColor("9bd2d2")
          .setDescription(
            ":warning: | La date indiquée est déja passée, veuillez la modifier."
          ),
      ],
      ephemeral: true,
    });

  setTimeout(() => {
    Client.functions.open(Client);
  }, reopenTimestamp - currTimestamp);

<<<<<<< HEAD
  let closedRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("OpenTicketSystem")
      .setLabel("Commencer une permanence")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🔓"),

    new ButtonBuilder()
      .setCustomId("CloseTicketSystem")
      .setLabel("Fin de la permancence")
      .setStyle(ButtonStyle.Danger)
=======
  let closedRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("OpenTicketSystem")
      .setLabel("Commencer une permanence")
      .setStyle("SUCCESS")
      .setEmoji("🔓"),

    new MessageButton()
      .setCustomId("CloseTicketSystem")
      .setLabel("Fin de la permancence")
      .setStyle("DANGER")
>>>>>>> master
      .setEmoji("🔒")
      .setDisabled(true)
  );

  Client.dashboard.message.edit({
    embeds: [
<<<<<<< HEAD
      new EmbedBuilder()
=======
      new MessageEmbed()
>>>>>>> master
        .setColor("9bd2d2")
        .setDescription("🔒 | La permanence est actuellement fermée !"),
    ],
    components: [closedRow],
    content: null,
  });

  Client.user.setPresence({
    status: "dnd",
  });

  interaction.message.delete();

  Client.user.setActivity("la permanence fermée !", { type: "WATCHING" });

  let mainGuild = await Client.guilds.fetch(Client.settings.mainGuildID);
  if (mainGuild) {
    let channel = await mainGuild.channels.fetch(
      Client.settings.ticketOpening.channel
    );
    if (channel) {
      let message = await channel.messages.fetch(
        Client.settings.ticketOpening.message
      );
      if (message) {
        message.edit({
          embeds: [
<<<<<<< HEAD
            new EmbedBuilder().setColor("9bd2d2")
=======
            new MessageEmbed().setColor("9bd2d2")
>>>>>>> master
              .setDescription(`🔒 | La permanence est actuellement fermée ! La prochaine permanence aura lieu <t:${formatTimestamp}:R>

                            En cas de soucis urgent, n'hésite pas a te rendre dans <#718250345951658064>`),
          ],
          components: [],
        });
      }
    }

    let voiceChannel = await mainGuild.channels.fetch(
      Client.settings.voiceTicketChannelID
    );
    if (voiceChannel) {
      voiceChannel.permissionOverwrites.edit(mainGuild.id, {
<<<<<<< HEAD
        ViewChannel: false,
=======
        VIEW_CHANNEL: false,
>>>>>>> master
        CONNECT: false,
      });
    }
  }

  await Client.reOpen.findAll().then((olds) => {
    olds.forEach(async (old) => {
      await old.destroy();
    });
  });

  await Client.reOpen.create({
    timestamp: reopenTimestamp,
  });
};
