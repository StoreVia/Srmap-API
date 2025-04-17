const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = class RegisterCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('logout')
                .setDescription('Logout Your Account.'),
            usage: '/logout',
            category: 'settings',
            permissions: ['Send Messages'],
        });
    }

    async run(client, interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const userId = interaction.user.id;
        const user = await client.quickdb.get(`user_${userId}`);
        if(!user){
            interaction.followUp({ content: '❌ No Login Details Found On Your Username.' });
        } else {
            await client.quickdb.delete(`user_${userId}`);
            interaction.followUp({ content: '✅ Logout Success! To Login Again Use "/login" Command.' });
        }
    }
};