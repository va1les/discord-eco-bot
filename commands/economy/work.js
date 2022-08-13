const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('work')
        .setDescription("Заработать."),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        let workReply = ['Таксиста', 'Курьера', 'Продавца', 'Программиста', 'Кассира', 'Строителя', 'Грузчика', 'Уборщика', 'Официанта', 'Электрика', 'Охранника', 'Повара']
        let result_workReply = Math.floor(Math.random() * workReply.length);
        const target = interaction.user;

        let data = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (!data) {
            await User.create({ guildId: interaction.guild.id, userId: target.id });
        }
        if (Date.now() < data.economy.lastWork) {
            const lastWork = new Date(data.economy.lastWork);
            const timeLeft = Math.round((lastWork.getTime() - Date.now()) / 1000);
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft - hours * 3600) / 60);
            const seconds = timeLeft - hours * 3600 - minutes * 60;
            return interaction.reply({ embeds: [new MessageEmbed().setColor(Config.colors.warning).setDescription(`⏱️ ${hours ? `${hours}:` : ''}${minutes ? `${minutes}:` : ''}${seconds ? `${seconds}` : ''}`)] })
        }
        let amount = Math.floor(Math.random() * 400) + 100;
        await User.updateOne({ guildId: interaction.guild.id, userId: target.id }, {
            $set: {
                'economy.lastWork': Date.now() + 7200000,
                'economy.balance': data.economy.balance + amount
            }
        })
        // let newdata = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        let Embed = new MessageEmbed()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Вы устроились на работу в качестве **${workReply[result_workReply]}**.`)
            .addFields({ name: `Заработок:`, value: `💰 ${amount}` })
            .setColor(Config.colors.success)
        interaction.reply({ embeds: [Embed] })
    }
}