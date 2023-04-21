const { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('change-сommission')
        .setDescription("Изменить комиссию на сервере")
        .addNumberOption(option => option.setName("число").setDescription("Комиссия, которая будет на сервере").setMaxValue(100).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: false })
        let num = interaction.options.getNumber("число")
        let guild = client.db.guild.findOne({ gid: interaction.guild.id })
        await client.db.guild.updateOne({ gid: interaction.guild.id }, {
            $set: {
                "comm": num
            }
        })
        await interaction.editReply({content: `${client.emoji.success} комиссия изменена с **${guild?.comm || 10}%** на **${num}**%!`,})
    }
}