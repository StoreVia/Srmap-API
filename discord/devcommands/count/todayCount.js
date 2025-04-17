const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');

module.exports = class InteractionCount extends Command {
    constructor(client){
        super(client, {
            data: new SlashCommandBuilder()
                .setName('today_count')
                .setDescription('Count No. Of Users From Today Or Specific No. Of Days (Developer Only Command).')
                .addStringOption(option =>
                    option.setName('days')
                        .setDescription('Enter No.of Days.')
                        .setRequired(false)
                ),
            usage: '/today_count {days}(optional)',
            category: 'Count',
            allowed: [ "1079794484130365561", "1354430841517899837", "1355006694748586126" ],
            developerCommand: true,
            permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
        });
    }

    async run(client, interaction) {
        await interaction.deferReply();
        const allowedUsers = this.allowed || [];
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
        }
        const daysString = interaction.options.getString('days');
        let startDate = new Date();
        if (daysString) {
            const days = parseInt(daysString);
            if (!isNaN(days)) {
                startDate.setDate(startDate.getDate() - days);
            } else {
                return interaction.followUp({ content: '> Invalid! Try With Valid Number.' });
            }
        }
        const formattedDate = startDate.toISOString().split('T')[0];
        const total = await client.db.countDocuments({
            updated_at: { $gte: formattedDate }
        });
        interaction.followUp({ content: `> Total Users Visited Since ${formattedDate}: **${total}** Users` });
    }
};
