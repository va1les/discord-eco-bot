const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('timely')
        .setDescription("Забрать бонус"),
    async execute(client, interaction) {
        if (Date.now() < (await client.db.user.findOne({ uid: interaction.user.id, gid: interaction.guild.id }))?.timely) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply({
                content: `${client.emoji.error} **${interaction.user.tag}**, вы уже забирали бонус...\nПопробуйте снова <t:${~~(((await client.db.user.findOne({ uid: interaction.user.id }))?.timely) / 1000)}:R>`
            });
        }
        await interaction.deferReply({ ephemeral: false })
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'Ежедневный бонус', iconURL: 'https://images-ext-1.discordapp.net/external/yEXjHWXolTKNsyKIwGKWJv12aT6A4BIcTWqWHfR1ea0/https/cdn-icons-png.flaticon.com/512/1254/1254293.png' })
                    .setDescription(`**${interaction.user.tag}**, забрал свои ${client.emoji.eco.coin}**250**`)
                    .addFields({
                        name: `Следующий бонус можно забрать`,
                        value: `<t:${~~((Date.now() + 43200000) / 1000)}:F>`
                    })
                    .setColor(client.colors.default)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ iconURL: interaction.guild.iconURL(), text: interaction.guild.name })
                    .setTimestamp()
            ]
        });
        await client.db.user.updateOne({ gid: interaction.guild.id, uid: interaction.user.id }, {
            $inc: { balance: +250 },
            $set: { timely: Date.now() + 43200000 },
        })
    }
}