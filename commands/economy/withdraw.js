const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription("Вывести деньги с банка.").addStringOption(opt => opt
            .setName('количество').setRequired(true).setDescription('Введите число которое хотите перевести на счет.')),
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
            amount = data.economy.bank;
        }
        if (data.economy.bank < amount) return interaction.reply({ content: `❌ ${interaction.user.tag}, введите перевод не больше вашего банка.`, ephemeral: true });
        await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
            $inc: {
                'economy.bank': -amount,
                'economy.balance': +amount
            },
        }, { new: true, upsert: true })
        interaction.reply({ content: `На счет переведено **${amount}**.`, ephemeral: true })
    }
}