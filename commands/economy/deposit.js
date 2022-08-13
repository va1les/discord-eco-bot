const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription("Перевести деньги в банк.").addStringOption(opt => opt
            .setName('количество').setRequired(true).setDescription('Введите число которое хотите перевести в банк.')),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        let amount = interaction.options.getString('количество');
        let data = await User.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
        if (!data) {
            await User.create({ guildId: interaction.guild.id, userId: interaction.user.id });
        }
        if (amount === 'all') {
            amount = data.economy.balance;
        }
        if (data.economy.balance < amount) return interaction.reply({ content: `❌ ${interaction.user.tag}, введите перевод не больше вашего баланса.`, ephemeral: true });
        await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
            $inc: {
                'economy.bank': +amount,
                'economy.balance': -amount
            },
        }, { new: true, upsert: true })
        interaction.reply({ content: `В банк переведено **${amount}**.`, ephemeral: true })
    }
}