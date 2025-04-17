const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = class InteractionAddAd extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('add_advertisement')
                .setDescription('Add An Advertisement(Developer Only Command).')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Enter Advertisement Title.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Enter Advertisement Description.')
                        .setRequired(true)
                ),
            usage: '/add_advertisement {title} {description}',
            allowed: [ "1079794484130365561" ],
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
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const filePath = path.resolve(__dirname, '../../../ad.json');
        const newData = { title, description };
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 4));
        interaction.followUp({ content: `✅ Advertisement Added.` });
    }
};
