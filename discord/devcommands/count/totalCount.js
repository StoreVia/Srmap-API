const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');

module.exports = class TotalUsers extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('total_count')
                .setDescription('Returns Total No.of Users.'),
            usage: '/total_count',
            category: 'Count',
            allowed: [ "1079794484130365561", "1354430841517899837", "1355006694748586126" ],
            developerCommand: true,
            permissions: ['Send Messages'],
        });
    }
    async run(client, interaction) {
        await interaction.deferReply();
        const allowedUsers = this.allowed || [];
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
        }
        const totalUsers = await client.db.countDocuments();
        interaction.followUp({ content: `📊 **Total Users:** ${totalUsers}` });
    }
};
