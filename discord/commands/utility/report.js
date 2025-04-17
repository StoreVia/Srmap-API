const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, EmbedBuilder, MessageFlags, WebhookClient } = require('discord.js');

module.exports = class ProfileCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('report')
                .setDescription('Report An Issue.')
                .addStringOption(option =>
                    option.setName('issue')
                        .setDescription('Type Your Issue Here')
                        .setRequired(true)
                    ),
            usage: '/report {issue}',
            category: 'utility',
            permissions: ['Send Messages'],
        });
    }

    async run(client, interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const report = await interaction.options.getString("issue");
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} (Discord)`)
            .setDescription(`${report}`)
            .setColor(5814783)
            .setTimestamp();
        const webhookClient1 = new WebhookClient({ url: process.env.discordhook });
        await webhookClient1.send({ embeds: [embed] });
        await interaction.followUp({ content: "✅ Report Submitted Successfully!" });
    }
};