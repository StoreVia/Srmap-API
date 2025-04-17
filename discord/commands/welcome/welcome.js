const Command = require('../../structures/Commands/CommandClass');
const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = class Welcome extends Command {
	constructor(client){
		super(client, {
			data: new SlashCommandBuilder()
				.setName('welcome')
				.setDescription('Setup Welcome System.')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
                .addSubcommandGroup(group =>
                    group.setName(`channel`)
                        .setDescription(`Set Welcome Channel.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName('set')
                                .setDescription('Set Welcome Channel.')
                                .addChannelOption(option =>
                                    option.setName('channel')
                                        .addChannelTypes(ChannelType.GuildText)
                                        .setDescription('Select Channel')
                                        .setRequired(true)))
                        .addSubcommand(subcommand =>
                            subcommand.setName('delete')
                                .setDescription('Delete Welcome Channel.')))
                .addSubcommandGroup(group =>
                    group.setName(`edit`)
                        .setDescription(`Welcome System Configuration.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName(`text`)
                                .setDescription(`Edit Text Welcome Message When A User Join's Server.`))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`color`)
                                    .setDescription(`Edit Text Color In Welcome Image.`)
                                    .addStringOption(option =>
                                        option.setName(`colorname`)
                                            .setDescription(`Select The Color You Need In Welcome Image.`)
                                            .setRequired(true)
                                            .addChoices(
                                                { name: `Black`, value: `000000` },
                                                { name: `White`, value: `FFFFFF` },
                                                { name: `Orange`, value: `FFA500` },
                                                { name: `Blue`, value: `87CEEB` },
                                                { name: `Red`, value: `FF0000` },
                                                { name: `Brown`, value: `964B00` },
                                                { name: `Purple`, value: `A020F0` },
                                                { name: `Green`, value: `00FF00` },
                                                { name: `Yellow`, value: `FFFF00` })))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`background`)
                                .setDescription(`Edit Welcome Image Background.`)
                                .addStringOption(option =>
                                    option.setName('url')
                                        .setDescription(`Enter Background Url For Welcome Message.`)
                                        .setRequired(true))))
                .addSubcommandGroup(group =>
                    group.setName(`dm-user`)
                        .setDescription(`Edit User's Dm Welcome Message When That User Join's Server.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName(`edit-text`)
                                .setDescription(`Edit User's Dm Welcome Message When That User Join's Server.`))
                        .addSubcommand(subcommand => 
                            subcommand.setName(`edit-thumbnail`)
                                .setDescription(`Edit Welcome Image Background In User Dm.`)
                                .addStringOption(option =>
                                    option.setName(`url`)
                                    .setDescription(`Enter Background Url For Welcome Message In User Dm.`)
                                    .setRequired(true)))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`edit-color`)
                                .setDescription(`Select The Color You Need In Welcome Image In User Dm.`)
                                .addStringOption(option =>
                                    option.setName(`colorname`)
                                        .setDescription(`Select The Color You Need In Welcome Image.`)
                                        .setRequired(true)
                                        .addChoices(
                                            { name: `Black`, value: `000000` },
                                            { name: `White`, value: `FFFFFF` },
                                            { name: `Orange`, value: `FFA500` },
                                            { name: `Blue`, value: `87CEEB` },
                                            { name: `Red`, value: `FF0000` },
                                            { name: `Brown`, value: `964B00` },
                                            { name: `Purple`, value: `A020F0` },
                                            { name: `Green`, value: `00FF00` },
                                            { name: `Yellow`, value: `FFFF00` })))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`dset`)
                                .setDescription(`Dm's User When Joined Server.`)
                                .addStringOption(option =>
                                    option.setName(`set`)
                                        .setDescription(`Dm's User When Joined Server Settings.`)
                                        .setRequired(true)
                                        .addChoices(
                                            { name: 'On', value: 'on'},
                                            { name: 'Off', value: 'off'}))))
                .addSubcommand(subcommand => 
                    subcommand.setName(`guide`)
                        .setDescription(`Get Guidence About Setting Welcome System.`)),
			usage: 'welcome',
			category: 'welcome',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links', 'Manage Guild'],
		});
	}
	async run(client, interaction){

        const welcomesetdb = client.quickdb.table(`welcome`);
		const welcomeconfigurationdb = client.quickdb.table(`welcomeconfiguration`);
		const welcomedmdb = client.quickdb.table(`welcomedm`);
		const welcomedmconfigurationdb = client.quickdb.table(`welcomedmconfiguration`);
		const welcomesetcheck = await welcomesetdb.get(`${interaction.guild.id}`);
		const welcomeconfigurationcheck = await welcomeconfigurationdb.get(`${interaction.guild.id}`);
		const welcomedmcheck = await welcomedmdb.get(`${interaction.guild.id}`);
		const welcomedmconfigurationcheck = await welcomedmconfigurationdb.get(`${interaction.guild.id}`);
        let subcommand = await interaction.options.getSubcommand();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === 'set'){
            const channel1 = await interaction.options.getChannel('channel');
            if(!welcomesetcheck){
                await interaction.deferReply({ ephemeral: true });
                await welcomesetdb.set(`${interaction.guild.id}`, channel1.id);
                return await interaction.followUp({ content: `> Welcome System Was Now Bounded To ${channel1}.`})
            } else if(channel1.id === welcomesetcheck){
                await interaction.deferReply({ ephemeral: true });
                return await interaction.followUp({ content: `> Welcome System Was Already Linked To ${channel1}.`})
            } else if(channel1.id != welcomesetcheck){
                await interaction.deferReply({ ephemeral: true });
                await welcomesetdb.set(`${interaction.guild.id}`, channel1.id);
                return await interaction.followUp({ content: `> Welcome System Was Now Updated To ${channel1}.`})
            }
        }
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "delete"){
            if(!welcomesetcheck){
                await interaction.deferReply({ ephemeral: true });
                return await interaction.followUp({ content: `> Welcome System Was Not Bounded To Any Channel.`})
            } else if(welcomesetcheck){
                await interaction.deferReply({ ephemeral: true });
                await welcomesetdb.delete(`${interaction.guild.id}`);
                return await interaction.followUp({ content: `> Welcome System Was Now Deleted In <#${welcomesetcheck}>.`})
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === 'background'){
            await interaction.deferReply({ ephemeral: true })
            const background = await interaction.options.getString('url');
            let validurl = await client.functions.isValidImgUrl(background);
            if(!welcomesetcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Welcome System Yet. Use "/welcome channel set" Command To Setup Welcome System.` })
            } else {
                if(validurl){
                    let text1 = welcomeconfigurationcheck?.text || null;
				    let color1 = welcomeconfigurationcheck?.color || null;
                    welcomeconfigurationdb.set(`${interaction.guild.id}`, {
                        text: text1,
                        color: color1,
                        thumbnail: background 
                    })
                    return await interaction.followUp({ content: `> Done✅. Welcome Image Background Was Updated.` })
                } else {
                    return await interaction.followUp({ content: `> Invlaid Url. Url Must Have Image Type Extension At Last.` })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "text"){
            if(!welcomesetcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Welcome System Yet. Use "/welcome channel set" Command To Setup Welcome System.` })
            } else {
                const welcometextedit = new ModalBuilder()
			        .setCustomId('myModalWelcomeTextEdit')
			        .setTitle('Welcome System Configuration.');
		        const welcometextedit1 = new TextInputBuilder()
			        .setCustomId('text1')
			        .setLabel("Send's This Text When Some One Join Server.")
			        .setStyle(TextInputStyle.Paragraph);
		        const welcometextedit0 = new ActionRowBuilder().addComponents(welcometextedit1);
		        welcometextedit.addComponents(welcometextedit0);
                await interaction.showModal(welcometextedit);
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "color"){
            await interaction.deferReply({ ephemeral: true })
            if(!welcomesetcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Welcome System Yet. Use "/welcome channel set" Command To Setup Welcome System.` })
            } else {
                const colorCode = await interaction.options.getString(`colorname`);
                let text1 = welcomeconfigurationcheck?.text || null;
				let background = welcomeconfigurationcheck?.thumbnail || null;
                welcomeconfigurationdb.set(`${interaction.guild.id}`, {
                    text: text1,
                    color: colorCode,
                    thumbnail: background 
                })
                return await interaction.followUp({ content: `> Done✅. Welcome Image Color Was Updated` });
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "dset"){
            await interaction.deferReply({ ephemeral: true });
            const set = await interaction.options.getString("set");
            if(set === "on"){
                if(welcomedmcheck){
                    return interaction.followUp({ content: `> Welcome Message Through Dm Is Active In Your Server. If You Want To Make Any Changes Of The Dm Message Use "/welcome dm-user edit-text" Command.` })
                } else {
                    await welcomedmdb.set(`${interaction.guild.id}`, "on")
                    return interaction.followUp({ content: `> Done✅. Welcome Message Through Dm Is Now Activated In Your Server.` })
                }
            } else if(set === "off"){
                if(welcomedmcheck){
                    await welcomedmdb.delete(`${interaction.guild.id}`)
                    await interaction.followUp({ content: `> Done✅. Welcome Message Through Dm Is Now Deactivated In Your Server.`})
                } else {
                    await interaction.followUp({ content: `> Welcome Message Through Dm Is Deactivated Already.`})
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "edit-text"){
            if(!welcomedmcheck){
                await interaction.deferReply({ ephemeral: true });
                return interaction.followUp({ content: `> You Have Not Setup Welcome Dm-User System Yet. Use "/welcome dm-user dset" Command To Setup It.` })
            } else {
                const welcomedmuserold = new ModalBuilder()
			        .setCustomId('myModalDmUserTextEdit')
			        .setTitle('Welcome System Configuration.');
		        const welcomedmuserold1 = new TextInputBuilder()
			        .setCustomId('text3')
			        .setLabel("Send's This DmText When Some One Join Server.")
			        .setStyle(TextInputStyle.Paragraph);
		        const welcomedmuserold0 = new ActionRowBuilder().addComponents(welcomedmuserold1);
		        welcomedmuserold.addComponents(welcomedmuserold0);
                await interaction.showModal(welcomedmuserold);
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "edit-thumbnail"){
            await interaction.deferReply({ ephemeral: true })
            const background = await interaction.options.getString('url');
            let validurl = await client.functions.isValidImgUrl(background);
            if(!welcomedmcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Welcome System For Dm User Yet. Use "/welcome dm-user dset" Command To Setup It.` })
            } else {
                if(validurl){
                    let text1 = welcomedmconfigurationcheck?.text || null;
				    let color1 = welcomedmconfigurationcheck?.color || null;
                    welcomedmconfigurationdb.set(`${interaction.guild.id}`, {
                        text: text1,
                        color: color1,
                        thumbnail: background 
                    })
                    return await interaction.followUp({ content: `> Done✅. Welcome Image Background Was Updated In Dm.` })
                } else {
                    return await interaction.followUp({ content: `> Invlaid Url. Url Must Have Image Type Extension At Last.` })
                }
            }
        }
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "edit-color"){
            await interaction.deferReply({ ephemeral: true });
            if(!welcomedmcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Welcome System For Dm User Yet. Use "/welcome dm-user dset" Command To Setup It.` })
            } else {
                const colorCode = await interaction.options.getString(`colorname`);
                let text1 = welcomedmconfigurationcheck?.text || null;
				let background = welcomedmconfigurationcheck?.thumbnail || null;
                welcomedmconfigurationdb.set(`${interaction.guild.id}`, {
                    text: text1,
                    color: colorCode,
                    thumbnail: background 
                })
                return await interaction.followUp({ content: `> Done✅. Welcome Image Color Was Updated In Dm.` });
            }
        }
        
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "guide"){
            await interaction.deferReply({ ephemeral: true })
            const embed = new EmbedBuilder()
                .setTitle(`GroBot Welcome System Guide `)
                .setDescription(`> **Note: ** Use \`:emoji_name:\` To Use Emoji In Welcome Message, Use \`<a:emoji_name:emoji_id>\` To Use Emoji Gif In Welcome Message & This Message Also Inlcudes For Dm Messages.`)
                .setImage(`https://i.imgur.com/YvxM0bc.png`)
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

