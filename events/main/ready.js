module.exports = {
    name: 'ready',
    async execute(client) {
        require('../../handlers/cmd.js').init(client)
        console.log(`✨ ${client.user.tag} logged.`);
        client.user.setActivity('Terraria', {type: 1})
    }
}
