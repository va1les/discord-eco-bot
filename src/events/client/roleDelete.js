module.exports = {
    name: 'roleDelete',
    once: false,
    async execute(client, role) {
        let data = await client.db.guild.findOne({ gid: role.guild.id });
        for (let i = 0; i < data?.shop?.length; i++) {
            if (role.id === data?.shop[i].id) {
                await client.db.guild.updateOne({ gid: role.guild.id }, {
                    $pull: {
                        "shop": data?.shop[i]
                    }
                });
            }
        }
    }
}