const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');

module.exports = class InteractionLimit extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('set_limit')
                .setDescription('Set User Limit To Certain Count(new 24hr only && 3 hr limit)(Developer Only Command).')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Enter Username.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Enter New Count Limit.')
                        .setRequired(true)
                ),
            usage: '/set_limit {username} {count}',
            category: 'User Management',
            allowed: [ "1079794484130365561", "1354430841517899837", "1355006694748586126" ],
            developerCommand: true,
            permissions: ['Manage Messages'],
        });
    }

    async run(client, interaction) {
        try {
            await interaction.deferReply();
            const allowedUsers = this.allowed || [];
            if (!allowedUsers.includes(interaction.user.id)) {
                return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
            }
            const username = interaction.options.getString('username').toUpperCase();
            const newLimit = interaction.options.getInteger('count');
            const result = await client.db.updateOne(
                { username: username },
                { $set: { limit: newLimit, updated_at: new Date().toISOString().split('T')[0] } }
            );
            if (result.matchedCount === 0) {
                return interaction.followUp({ content: `❌ No User Found (**${username}**).` });
            }
            interaction.followUp({ content: `✅ Limit For (**${username}**) Has Been Set To (**${newLimit}**) => Valid For (24hr && 3 hr Rule).` });

        } catch (error) {
            console.error("[ERROR]", error);
            interaction.followUp({ content: `❌ Error: ${error.message}` });
        }
    }
};
