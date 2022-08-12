const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription("Список лидеров на сервере по экномике."),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const profiles = await User.find({ guildId: interaction.guild.id });
        const sort = profiles.sort((a, b) => b.economy.balance - a.economy.balance);
        const top10 = sort.slice(0, 10);
        let Embed = new MessageEmbed()
            .setDescription(`${top10.length ? top10.map((user, index) => `**${index + 1}.** <@${user.userId}> — 💰 ${user.economy.balance} | 🏦 ${user.economy.bank}`).join('\n') : 'Пользователей в списке нет.'}`)
            .setColor(Config.colors.success)

        interaction.reply({ embeds: [Embed] })
    }
}