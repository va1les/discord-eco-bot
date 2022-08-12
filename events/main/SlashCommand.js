const { Interaction, Client, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const Perms = require('../../jsons/permissions.json');
const { checkDB } = require('../../utils/funcs');

let Guild = require('../../models/Guild')
let User = require('../../models/User');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {Interaction} interaction
     * @param {Client} client
     */
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.guild) return;

        await checkDB(interaction.user.id, interaction.guild.id)
        !(await GuildModel.findOne({ guildId: interaction.guild.id })) ? client.emit('guildCreate', interaction.guild) : null

        const cmd = client.commands.get(interaction.commandName)
        if (!cmd) return;

        interaction.guild.owner = await interaction.guild.fetchOwner()
        interaction.default = async (message, foo) => await interaction.reply({ embeds: [new MessageEmbed({ description: message, color: Config.colors.success })], ephemeral: foo })

        if (cmd.permissions && !Config.developers.includes(interaction.user.id)) {
            let invalidPerms = []
            for (const perm of cmd.permissions) {
                if (!interaction.member.permissions.has(perm)) invalidPerms.push(Perms[perm]);
            }
            if (invalidPerms.length) {
                return await interaction.reply({ content: `У вас не достаточно прав: \`${invalidPerms}\``, ephemeral: true });
            }
        }

        if (cmd.forMePerms) {
            let invalidPerms = []
            for (const perm of cmd.forMePerms) {
                if (!interaction.guild.me.permissions.has(perm)) invalidPerms.push(Perms[perm]);
            }
            if (invalidPerms.length) {
                return await interaction.reply({ content: `У меня не достаточно прав: \`${invalidPerms}\``, ephemeral: true });
            }
        }

        cmd.execute(client, interaction)
    }
}
