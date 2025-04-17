const Command = require('../../structures/Commands/CommandClass');
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = class Leave extends Command {
	constructor(client){
		super(client, {
			data: new SlashCommandBuilder()
				.setName('leave')
				.setDescription('Sends Leave Message When User Left Server.')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
                .addSubcommandGroup(group =>
                    group.setName(`channel`)
                        .setDescription(`Set Leave Message Channel.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName('set')
                                .setDescription('Set Leave Channel.')
                                .addChannelOption(option =>
                                    option.setName('channel')
                                        .addChannelTypes(ChannelType.GuildText)
                                        .setDescription('Select Channel')
                                        .setRequired(true)))
                        .addSubcommand(subcommand =>
                            subcommand.setName('delete')
                                .setDescription('Delete Leave Channel.')))
                .addSubcommandGroup(group =>
                    group.setName(`text`)
                        .setDescription(`Edit Leave Message.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName(`edit`)
                                .setDescription(`Edit Leave Message`)))
                .addSubcommand(subcommand => 
                    subcommand.setName(`guide`)
                        .setDescription(`Get Guidence About Setting Leave System`)),
			usage: 'ping',
			category: 'Info',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
		});
	}
	async run(client, interaction){

        const leavesetdb = client.quickdb.table(`leave`);
        const leavesetcheck = await leavesetdb.get(`${interaction.guild.id}`);
        let subcommand = await interaction.options.getSubcommand();
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === 'set'){
            const channel1 = await interaction.options.getChannel('channel');
            if(!leavesetcheck){
                await interaction.deferReply({ ephemeral: true });
                await leavesetdb.set(`${interaction.guild.id}`, channel1.id);
                return await interaction.followUp({ content: `> Leave System Was Now Bounded To ${channel1}.`})
            } else if(channel1.id === leavesetcheck){
                await interaction.deferReply({ ephemeral: true });
                return await interaction.followUp({ content: `> Leave System Was Already Linked To ${channel1}.`})
            } else if(channel1.id != leavesetcheck){
                await interaction.deferReply({ ephemeral: true });
                await leavesetdb.set(`${interaction.guild.id}`, channel1.id);
                return await interaction.followUp({ content: `> Leave System Was Now Updated To ${channel1}.`})
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "edit"){
            const leavetextedit = new ModalBuilder()
                .setCustomId('myModalLeaveEditText')
                .setTitle('Leaving Message Configuration.');
            const leavetextedit1 = new TextInputBuilder()
                .setCustomId('text1')
                .setLabel("Send's This Text When Some One Leave Server.")
                .setStyle(TextInputStyle.Paragraph);
            const leavetextedit0 = new ActionRowBuilder().addComponents(leavetextedit1);
            leavetextedit.addComponents(leavetextedit0);
            await interaction.showModal(leavetextedit);
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "delete"){
            if(!leavesetcheck){
                await interaction.deferReply({ ephemeral: true });
                return await interaction.followUp({ content: `> Leave System Was Not Bounded To Any Channel.`})
            } else {
                await interaction.deferReply({ ephemeral: true });
                await leavesetdb.delete(`${interaction.guild.id}`);
                return await interaction.followUp({ content: `> Leave System Was Now Deleted In <#${leavesetcheck}>.`})
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "guide"){
            const embed = new EmbedBuilder()
                .setTitle(`GroBot Leave System Guide `)
                .setDescription(`> **Note: **Use \`:emoji_name:\` To Use Emoji In Leave Message,Use \`<a:emoji_name:emoji_id>\` To Use Emoji Gif In Leave Message.`)
                .setImage(`https://i.imgur.com/aAoLgdQ.png`)
                .setColor(`${process.env.ec}`)
                .setFooter({
                    text: `${client.user.username} - ${process.env.year} ©`,
                    iconURL: process.env.iconurl
                })
            await interaction.deferReply({ ephemeral: true })
            await interaction.followUp({ embeds: [embed] })
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	}
};