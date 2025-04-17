const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = class InteractionAddAd extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('endterm')
                .setDescription('Sends End Term Panel.'),
            usage: '/endterm',
            allowed: [ "1079794484130365561" ],
            category: 'controls',
            permissions: ['Manage Messages'],
        });
    }
    async run(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const allowedUsers = this.allowed || [];
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.followUp({ content: '❌ You Are Not Allowed To Run This Command.' });
        }
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("autofd")
                .setLabel("Auto Submit Feedback")
                .setStyle(ButtonStyle.Primary)
        );
        const embed = new EmbedBuilder()
            .setTitle("End Term Feedback")
            .setDescription("=> Clicking Below Button Submits Your Endterm Feedback Automatically. Use The Button If And Only If It Is Necessary.\n\n**BY CLICKING BELOW BELOW BUTTON YOU AGREE TO FOLLOWING TERMS:- **\n=> I(you) Have No Complains And Am Submitting FeedBack **VOLUNTARILY**\n=> I(you) Take **FULL RESPONSIBILITY** For My Submission And It's Consequences.\n=> I(you) Understood This Action Cannot Be **UnDone**.")
            .setColor(`${process.env.ec}`)
            .setFooter({ text: "Srmap API" })
            .setThumbnail(`${process.env.thumbnail}`);
        await client.channels.cache.get(process.env.fb).send({ embeds: [embed], components: [buttonRow] }).then(() => {
            interaction.followUp({ content: "✅ Done." })
        })
    }
};
