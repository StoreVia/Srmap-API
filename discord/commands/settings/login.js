const Command = require('../../structures/Commands/CommandClass');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = class RegisterCommand extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('login')
                .setDescription('Logins You To You Srmap Student Account.')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Enter Your Registration Number(eg:- AP23000000002).')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('password')
                        .setDescription('Enter Your Student Portal Password.')
                        .setRequired(true)
                ),
            usage: '/login {username} {password}',
            category: 'settings',
            permissions: ['Send Messages'],
        });
    }

    async run(client, interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const userId = interaction.user.id;
        const username = interaction.options.getString('username').toUpperCase();
        const password = interaction.options.getString('password');
        await client.quickdb.set(`user_${userId}`, { un: username, pass: password });
        interaction.followUp({ content: '✅ Login Success! You Can Now Use Slash Commands.' });
    }
};