const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = class InteractionAddAd extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('delete_advertisement')
                .setDescription('Delete Exisiting Advertisement.'),
            usage: '/deleteadvertisement',
            allowed: [ "1079794484130365561" ],
            developerCommand: true,
            category: 'Advertisement',
            permissions: ['Manage Messages'],
        });
    }
    async run(client, interaction) {
        await interaction.deferReply();
        const allowedUsers = this.allowed || [];
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
        }
        const filePath = path.resolve(__dirname, '../../../ad.json');
        fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
        await interaction.followUp({ content: `✅ Delete Advertisement.` });
    }
};
