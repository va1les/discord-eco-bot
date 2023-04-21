const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('balance')
        .setDescription("Узнать баланс").addUserOption(option => option.setName("пользователь").setDescription("Узнать баланс другого пользователя").setRequired(false)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: false })
        let target = interaction.options.getUser("пользователь") || interaction.user;
        if (target.bot) return interaction.editReply({ content: `${client.emoji.error} **${interaction.user.tag}**, вы указали бота, им это не нужно.` });
        const data = await client.db.user.findOne({ uid: target.id, gid: interaction.guild.id });
        if (!data) return interaction.editReply({ content: `${client.emoji.error} **${target.tag}**, не имеет экономического профиля.` });
        let embed = new EmbedBuilder()
            .setAuthor({ name: `Баланс участника ${target.tag}`, iconURL: `https://images-ext-1.discordapp.net/external/Ypr2zhAtzdovwTg3N6OX_GTGwRG09sS1ktMT2a3xSjc/%3Fsize%3D56/https/cdn.discordapp.com/emojis/896158535082205255.png` })
            .setDescription(`${client.emoji.eco.cash} **На руках:** ${client.emoji.eco.coin} ${data?.balance || 0}\n${client.emoji.eco.bank} **В банке:** ${client.emoji.eco.coin} ${data?.bank || 0}\n${client.emoji.eco.all} **Общий баланс:** ${client.emoji.eco.coin} ${(data?.balance || 0) + (data?.bank || 0)}`)
            .setColor(client.colors.default)
            .setFooter({ iconURL: interaction.guild.iconURL(), text: interaction.guild.name })
            .setTimestamp()
            .setThumbnail(target.displayAvatarURL());
        if (data.timely < Date.now() || data.daily < Date.now() || data.weekly < Date.now()) {
            let arr = [];
            if (data.timely < Date.now()) arr.push("`/timely`")
            if (data.daily < Date.now()) arr.push("`/daily`")
            if (data.weekly < Date.now()) arr.push("`/weekly`")
            embed.addFields({
                name: `⭐ Награды`,
                value: `${target != interaction.user ? "Ему доступны награды:" : "Вам доступны награды:"} ${arr.join(", ")}`
            })
        }
        await interaction.editReply({
            embeds: [embed]
        })
    }
}
// 