const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('buy')
        .setDescription("Купить предмет из магазина").addNumberOption(option => option.setName("номер").setDescription("Введите номер роли").setMaxValue(10).setRequired(true)),
    async execute(client, interaction) {
        let data = await client.db.guild.findOne({ gid: interaction.guild.id });
        let number = await interaction.options.getNumber("номер");
        let buy = new ActionRowBuilder().addComponents([new ButtonBuilder().setCustomId("buy").setStyle(ButtonStyle.Primary).setLabel("Купить").setEmoji("💳")])
        if (number > data?.shop?.length) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply({
                content: `${client.emoji.error} такого товара не существует.`
            });
        } else {
            await interaction.deferReply({ ephemeral: false })
            let reply = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.colors.default)
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                        .setTitle('Информация о товаре')
                        .addFields({
                            name: `Роль`,
                            value: `<@&${data?.shop[number - 1].id}> (ID: \`${data?.shop[number - 1].id}\`)`,
                            inline: true
                        }, {
                            name: `Стоимость роли`,
                            value: `${client.emoji.eco.coin} ${data?.shop[number - 1].amount}`,
                            inline: true
                        })
                        .setFooter({ text: `Счет действителен 30 секунд`, iconURL: `https://images-ext-1.discordapp.net/external/j1e3jYv-LHCpZajduipXdMa4uuBagheFXAUFffhHFv8/%3Fsize%3D128/https/cdn.discordapp.com/emojis/776404508656795648.png` })
                ], components: [buy]
            });
            const collector = reply.createMessageComponentCollector()
            let timer = setTimeout(() => {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.colors.default)
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                            .setTitle('Информация о товаре')
                            .addFields({
                                name: `Роль`,
                                value: `<@&${data?.shop[number - 1].id}> (ID: \`${data?.shop[number - 1].id}\`)`,
                                inline: true
                            }, {
                                name: `Стоимость роли`,
                                value: `${client.emoji.eco.coin} ${data?.shop[number - 1].amount}`,
                                inline: true
                            })
                            .setFooter({ text: `Счет больше не действителен`, iconURL: `https://images-ext-1.discordapp.net/external/j1e3jYv-LHCpZajduipXdMa4uuBagheFXAUFffhHFv8/%3Fsize%3D128/https/cdn.discordapp.com/emojis/776404508656795648.png` })
                    ], components: []
                });
                collector.stop()
            }, 30 * 1000);
            collector.on("collect", async i => {
                await i.deferUpdate().catch(() => null)
                if (i.user.id !== interaction.user.id) {
                    return await interaction.followUp({
                        content: `${client.emoji.error} вы не можете взаимодействовать с кнопками.`, ephemeral: true
                    });
                };
                if (i.customId === "buy") {
                    let user_data = await client.db.user.findOne({ gid: interaction.guild.id, uid: i.user.id })
                    if (user_data?.balance < data?.shop[number - 1].amount) {
                        return await interaction.followUp({
                            content: `${client.emoji.error} у вас недостаточно средств.`, ephemeral: true
                        });
                    }
                    for (let x = 0; x < data?.shop?.length; x++) {
                        if (interaction.member._roles[x] === data?.shop[number - 1].id) {
                            return await interaction.followUp({
                                content: `${client.emoji.error} у вас уже есть этот товар.`, ephemeral: true
                            });
                        }
                    }
                    await client.db.user.updateOne({ gid: interaction.guild.id, uid: i.user.id }, {
                        $inc: {
                            "balance": -data?.shop[number - 1].amount
                        }
                    });
                    await interaction.guild.roles.fetch(data?.shop[number - 1].id).then(
                        async role => {
                            i.member.roles.add(role).then(async xxx => {
                                await i.followUp({
                                    content: `${client.emoji.success} вы успешно приобрели роль <@&${data?.shop[number - 1].id}>`, ephemeral: true
                                })
                                await interaction.editReply({
                                    components: [], embeds: [
                                        new EmbedBuilder()
                                            .setColor(client.colors.default)
                                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                                            .setTitle('Информация о товаре')
                                            .addFields({
                                                name: `Роль`,
                                                value: `<@&${data?.shop[number - 1].id}> (ID: \`${data?.shop[number - 1].id}\`)`,
                                                inline: true
                                            }, {
                                                name: `Стоимость роли`,
                                                value: `${client.emoji.eco.coin} ${data?.shop[number - 1].amount}`,
                                                inline: true
                                            })
                                    ], content: `🎉 ${i.user} успешно приобрёл роль!`
                                });
                                clearTimeout(timer);
                            }, async err => {
                                return await interaction.followUp({
                                    content: `${client.emoji.error} роль была не найдена.`, ephemeral: true
                                });
                            })
                        })
                }
            })
        }
    }
}