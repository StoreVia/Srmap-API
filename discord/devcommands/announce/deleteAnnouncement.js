const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const NOTICE_FILE = path.join(__dirname, '../../../notice.json');

module.exports = class DeleteAnnouncement extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('delete_announcement')
                .setDescription('Delete Top Announcement(Developer Only Command).')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Enter No.of Top Announcements You Want To Delete.')
                        .setRequired(true)
                ),
            usage: '/delete_announcement {count}',
            category: 'announce',
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
            const count = interaction.options.getInteger('count');
            if (count <= 0) {
                return interaction.followUp({ content: '❌ Enter Number Greate Than 0.' });
            }
            if (!fs.existsSync(NOTICE_FILE)) {
                return interaction.followUp({ content: '❌ Notice.json Not Found.' });
            }
            let announcements = JSON.parse(fs.readFileSync(NOTICE_FILE, 'utf8'));
            if (announcements.length === 0) {
                return interaction.followUp({ content: '❌ No Announcement Found.' });
            }
            const deleteCount = Math.min(count, announcements.length);
            announcements.splice(0, deleteCount);
            fs.writeFileSync(NOTICE_FILE, JSON.stringify(announcements, null, 4), 'utf8');
            interaction.followUp({ content: `✅ Deleted ${deleteCount} announcements.` });

        } catch (error) {
            console.error("[ERROR]", error);
            interaction.followUp({ content: `❌ Error: ${error.message}` });
        }
    }
};
