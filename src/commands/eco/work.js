const { Client, CommandInteraction, EmbedBuilder } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('work')
        .setDescription("Выйти на работу"),
    async execute(client, interaction) {
        let works = ['Таксиста', 'Курьера', 'Продавца', 'Программиста', 'Кассира', 'Строителя', 'Грузчика', 'Уборщика', 'Официанта', 'Электрика', 'Охранника', 'Повара']
        // works[Math.floor(Math.random() * works.length)]
        let amount = Math.floor(Math.random() * 200) + 100;
        if (Date.now() < (await client.db.user.findOne({ uid: interaction.user.id, gid: interaction.guild.id }))?.work) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply({
                content: `${client.emoji.error} **${interaction.user.tag}**, вы уже были на работе...\nПопробуйте снова <t:${~~(((await client.db.user.findOne({ uid: interaction.user.id }))?.work) / 1000)}:R>`
            });
        }
        await interaction.deferReply({ ephemeral: false })
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'Работа', iconURL: 'https://images-ext-1.discordapp.net/external/EI98t0-aLVIO8Q365UYFMLaAcqz6oJcz18hrxoMCvtg/https/cdn-icons-png.flaticon.com/512/3281/3281289.png' })
                    .setDescription(`**${interaction.user.tag}**, вы устроились на работу в качестве **${works[Math.floor(Math.random() * works.length)]}**.`)
                    .addFields({
                        name: `Доход`,
                        value: `${client.emoji.eco.coin} ${amount}`
                    })
                    .setColor(client.colors.default)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ iconURL: interaction.guild.iconURL(), text: interaction.guild.name })
                    .setTimestamp()
            ]
        });
        await client.db.user.updateOne({ gid: interaction.guild.id, uid: interaction.user.id }, {
            $inc: { balance: +amount },
            $set: { work: Date.now() + 7200000 },
        })
    }
}