const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('pay')
        .setDescription("Перевести деньги другому пользователю.").addUserOption(opt => opt
            .setName('пользователь').setRequired(true).setDescription('Выберите пользователя.')).addStringOption(opt => opt
                .setName('количество').setRequired(true).setDescription('Введите число которое хотите перевести пользователю.')),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        let amount = interaction.options.getString('количество');
        let target = interaction.options.getUser('пользователь');
        let data = await User.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
        let target_data = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (!data) { await User.create({ guildId: interaction.guild.id, userId: target.id }); }
        else if (!target_data) { await User.create({ guildId: interaction.guild.id, userId: target.id }); }
        if (amount === 'all') {
            amount = data.economy.balance;
        }
        if (data.economy.balance < amount) return interaction.reply({ content: `❌ ${interaction.user.tag}, введите перевод не больше вашего баланса.`, ephemeral: true });
        await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
            $inc: {
                'economy.balance': -amount,
            }
        }, { new: true, upsert: true })
        await User.updateOne({ guildId: interaction.guild.id, userId: target.id }, {
            $inc: {
                'economy.balance': +amount,
            }
        }, { new: true, upsert: true })
        interaction.reply({ content: `На счет **${target.tag}** переведено **${amount}**.`, ephemeral: false })
    }
}