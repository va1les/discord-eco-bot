const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('balance')
        .setDescription("Пользовательский баланс.")
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription("Выберите пользователя.")
                .setRequired(false)),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const target = interaction.options.getUser('пользователь') || interaction.user;
        if (target.bot) return interaction.reply({ content: `❌ **${interaction.user.tag}**, боты не могут участвовать в программе экономике.`, ephemeral: true });

        let data = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (!data) {
            await User.create({ guildId: interaction.guild.id, userId: target.id });
        }
        let newdata = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        let Embed = new MessageEmbed()
            .setAuthor({ name: `Баланс: ${target.tag}`, iconURL: interaction.guild.iconURL() })
            .setColor(Config.colors.success)
            .setDescription(`💰 Денег: ${newdata.economy.balance || 0}\n🏦 Банк: ${newdata.economy.bank || 0}\n🪙 Всего: ${newdata.economy.balance + newdata.economy.bank}`)
            .setTimestamp()
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        interaction.reply({ embeds: [Embed] })
    }
}