const { Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('shop')
        .setDescription("Магазин ролей"),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: false })
        const data = await client.db.guild.findOne({ gid: interaction.guild.id });
        let embed = new EmbedBuilder({
            title: `${client.emoji.eco.shop} Магазин ролей`,
            color: client.colors.default,
            description: `**Как купить?**\n> Чтобы приобрести роль, вам нужно использовать команду\n> **</buy:${client.user.id}>** \`№ роли\``,
            fields: await Promise.all(data?.shop.map(async (item, index) => ({
                name: `Роль №${index + 1}`,
                value: `<@&${item.id}> — ${client.emoji.eco.coin} ${item.amount}`
            })))
        })
        if (data?.shop?.length < 1) {
            embed.setDescription(`${embed.data.description}\n> ${client.emoji.error} **товаров в магазине нет**`)
        }
        await interaction.editReply({
            embeds: [embed]
        })
    }
}