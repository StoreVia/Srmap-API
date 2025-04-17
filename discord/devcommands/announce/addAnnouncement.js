const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const NOTICE_FILE = path.join(__dirname, '../../../notice.json');

module.exports = class AnnounceCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('add_announcement')
                .setDescription('Make An Announcement(Developer Only Command).')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Enter New Announcement.')
                        .setRequired(true)
                ),
            usage: '/add_announcement {message}',
            category: 'announce',
            allowed: [ "1079794484130365561", "1354430841517899837", "1355006694748586126" ],
            developerCommand: true,
            permissions: ['Manage Messages'],
        });
    }
    async run(client, interaction) {
        await interaction.deferReply();
        const allowedUsers = this.allowed || [];
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
        }
        const announcement = interaction.options.getString('message');
        let announcements = [];
        if(fs.existsSync(NOTICE_FILE)){
            const data = fs.readFileSync(NOTICE_FILE, 'utf8');
            announcements = JSON.parse(data);
        }
        const newEntry = { id: Date.now(), message: announcement, date: new Date().toISOString() };
        announcements.unshift(newEntry);
        if(announcements.length > 10){
            announcements.pop();
        }
        fs.writeFileSync(NOTICE_FILE, JSON.stringify(announcements, null, 4));
        interaction.followUp({ content: '📢 Announcement Added!' });
    }
};
