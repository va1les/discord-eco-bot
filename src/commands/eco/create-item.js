const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('create-item')
        .setDescription("Добавить товар в магазин")
        .addRoleOption(option => option.setName("роль").setDescription("Роль, которая будет добавлена в магазин").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addNumberOption(option => option.setName("стоимость").setDescription("Укажите стоимость товара").setMaxValue(1000000).setRequired(true)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: false })
        if ((await client.db.guild.findOne({ gid: interaction.guild.id })).shop?.length > 10) {
            return await interaction.editReply({
                content: `${client.emoji.error} разработчик очень ленивый, поэтому максимум **10** товаров можно создать.`
            });
        }
        let role = interaction.options.getRole("роль");
        for (let item of (await client.db.guild.findOne({ gid: interaction.guild.id })).shop) {
            if (item.id === role.id) {
                return await interaction.editReply({
                    content: `${client.emoji.error} этот товар уже есть в магазине.`
                });
            }
        }
        if (interaction.guild.members.me.roles.highest.comparePositionTo(role.id) < 0) {
            return await interaction.editReply({
                content: `${client.emoji.error} **${interaction.user.tag}**, вы указали роль выше моей.`
            });
        }
        let amount = interaction.options.getNumber("стоимость");
        await interaction.editReply({
            content: `${client.emoji.success} товар добавлен в магазин ролей!`,
            embeds: [new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setTitle("Информация о товаре")
                .setColor(client.colors.default)
                .addFields({
                    name: `Роль`,
                    value: `${role} (ID: \`${role.id}\`)`,
                    inline: true
                }, {
                    name: `Стоимость роли`,
                    value: `${client.emoji.eco.coin} ${amount}`,
                    inline: true
                })]
        });
        await client.db.guild.updateOne({ gid: interaction.guild.id }, {
            $push: {
                shop: { id: role.id, amount: amount }
            }
        })
    }
}