const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription("Положить деньги в банк").addNumberOption(option => option.setName("сумма").setDescription("Сумма, которая будет вложена в банк").setRequired(true)),
    async execute(client, interaction) {
        let amount = interaction.options.getNumber("сумма");
        const data = await client.db.user.findOne({ uid: interaction.user.id, gid: interaction.guild.id })
        const guild_data = await client.db.guild.findOne({ gid: interaction.guild.id })
        if (amount > data?.balance) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply({
                content: `${client.emoji.error} **${interaction.user.tag}**, вы ввели число, которое не соответствует вашему текущему балансу.`, ephemeral: true
            });
        }
        await interaction.deferReply({ ephemeral: false })
        // создай переменную которая будет находить 10% от переменной amount
        let comm = amount * ((guild_data?.comm || 10) / 100)
        await client.db.user.updateOne({uid: interaction.user.id, gid: interaction.guild.id}, {
            $inc: {
                "balance":-amount,
                "bank":+(amount-comm)
            }
        })
        await interaction.editReply({
            embeds: [new EmbedBuilder().setAuthor({
                iconURL: "https://images-ext-2.discordapp.net/external/D8Zf-_PJK8aFyb_MbvAeGCxmxP27hn0rETPcfHkOC0s/https/cdn.discordapp.com/emojis/928621638503784468.png",
                name: "Внесение наличных"
            }).setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**${interaction.user}**, положил **${amount - comm}** ${client.emoji.eco.coin} в банк.`)
                .addFields({
                    name: `${client.emoji.eco.comm} Комиссия`,
                    value: `На этом сервере комиссия составляет **${guild_data?.comm || 10}%**`,
                    inline: true
                })
                .setColor(client.colors.default)
                .setFooter({ iconURL: interaction.guild.iconURL(), text: interaction.guild.name })
                .setTimestamp()
            ]
        })
    }
}