const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('delete-item')
        .setDescription("Узнать свой баланс").addNumberOption(option => option.setName("номер").setDescription("Введите номер роли").setMaxValue(10).setRequired(true)),
    async execute(client, interaction) {
        let data = await client.db.guild.findOne({ gid: interaction.guild.id });
        let number = await interaction.options.getNumber("номер");
        if (number > data?.shop?.length) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply({
                content: `${client.emoji.error} такого товара не существует.`
            });
        } else {
            await interaction.deferReply({ ephemeral: false })
            await client.db.guild.updateOne({ gid: interaction.guild.id }, {
                $pull: {
                    "shop": data?.shop[number - 1]
                }
            });
            return await interaction.editReply({
                content: `${client.emoji.success} товар удалён из магазина ролей.`,
                embeds: [new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setTitle("Информация о удалённом товаре")
                    .setColor(client.colors.error)
                    .addFields({
                        name: `Роль`,
                        value: `<@&${data?.shop[number - 1].id}> (ID: \`${data?.shop[number - 1].id}\`)`,
                        inline: true
                    }, {
                        name: `Стоимость роли`,
                        value: `${client.emoji.eco.coin} ${data?.shop[number - 1].amount}`,
                        inline: true
                    })]
            });
        }
    }
}