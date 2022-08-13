const { Client, CommandInteraction, MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../../models/User');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('rob')
        .setDescription("Ограбить пользователя.")
        .addUserOption(opt => opt
            .setName('пользователь').setRequired(true).setDescription('Выберите пользователя, которого хотите ограбить')),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        const target = interaction.options.getUser('пользователь')
        if (target.bot) return interaction.reply({ content: `❌ **${interaction.user.tag}**, боты не могут участвовать в программе экономике.`, ephemeral: true });
        let data = await User.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
        let target_data = await User.findOne({ guildId: interaction.guild.id, userId: target.id });

        if (!data) { await User.create({ guildId: interaction.guild.id, userId: target.id }); }
        else if (!target_data) { await User.create({ guildId: interaction.guild.id, userId: target.id }); }
        let newdata = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        let newtarget_data = await User.findOne({ guildId: interaction.guild.id, userId: target.id });
        if (Date.now() < data.economy.lastRob) {
            const lastWork = new Date(data.economy.lastRob);
            const timeLeft = Math.round((lastWork.getTime() - Date.now()) / 1000);
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft - hours * 3600) / 60);
            const seconds = timeLeft - hours * 3600 - minutes * 60;
            return interaction.reply({ embeds: [new MessageEmbed().setColor(Config.colors.warning).setDescription(`⏱️ ${hours ? `${hours}:` : ''}${minutes ? `${minutes}:` : ''}${seconds ? `${seconds}` : ''}`)] })
        }
        if (newtarget_data.economy.balance < 50) {
            return await interaction.reply({ content: `❌ **${interaction.user.tag}**, баланс указанного пользователя ниже 50.`, ephemeral: true })
        } else if (newdata.economy.balance < 50) {
            return await interaction.reply({ content: `❌ **${interaction.user.tag}**, ваш баланс ниже 50.`, ephemeral: true })
        }
        let random = Math.floor(Math.random() * 200) + 1;
        // 0 = НЕ УДАЧА
        // 1 = УДАЧА
        await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
            $set: {
                'economy.lastRob': Date.now() + 10800000,
            }
        })
        if (random < 100) {
            let fail_lost = newdata.economy.balance / Math.floor(Math.random() * 9) + 3
            let fail_lost_round = Math.floor(fail_lost)
            await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
                $inc: {
                    'economy.balance': -fail_lost_round,
                }
            })
            await User.updateOne({ guildId: interaction.guild.id, userId: target.id }, {
                $inc: {
                    'economy.balance': +fail_lost_round
                }
            })
            let Fail = new MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Вам не удалось ограбить **${target.tag}**.`)
                .addFields({ name: `Вы потеряли:`, value: `${fail_lost_round}` })
                .setColor(Config.colors.warning)
            await interaction.reply({ embeds: [Fail] })
        } else if (random > 100) {
            let win_prize = newtarget_data.economy.balance / Math.floor(Math.random() * 6) + 3
            let win_prize_round = Math.floor(win_prize)
            await User.updateOne({ guildId: interaction.guild.id, userId: interaction.user.id }, {
                $inc: {
                    'economy.balance': +win_prize_round
                }
            })
            await User.updateOne({ guildId: interaction.guild.id, userId: target.id }, {
                $inc: {
                    'economy.balance': -win_prize_round
                }
            })
            let Win = new MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Вам удалось ограбить **${target.tag}**.`)
                .addFields({ name: `Вы получили:`, value: `${win_prize_round}` })
                .setColor(Config.colors.success)
            await interaction.reply({ embeds: [Win] })
        }
    }
}