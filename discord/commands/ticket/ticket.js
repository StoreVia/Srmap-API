const Command = require('../../structures/Commands/CommandClass');
const { EmbedBuilder, SlashCommandBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, ActionRowBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const db = require(`quick.db`);

module.exports = class Ticker extends Command {
	constructor(client){
		super(client, {
			data: new SlashCommandBuilder()
				.setName('ticket')
				.setDescription('Setup Ticket System.')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
                .addSubcommand(subcommand =>
                    subcommand.setName('setup')
                        .setDescription(`Setup Ticket System.`)
                        .addChannelOption(option =>
                            option.setName(`channel`)
                                .setRequired(true)
                                .setDescription(`Select Channel That You Want To Send Ticket Panel.`)
                                .addChannelTypes(ChannelType.GuildText))
                        .addChannelOption(option =>
                            option.setName(`category`)
                                .addChannelTypes(ChannelType.GuildCategory)
                                .setRequired(true)
                                .setDescription(`Select Category For Tickets Creation.`))
                        .addChannelOption(option =>
                            option.setName(`ticket_logs`)
                                .setRequired(true)
                                .setDescription(`Setup Ticket Logs Channel.`)
                                .addChannelTypes(ChannelType.GuildText))
                        .addRoleOption(option =>
                            option.setName(`support_role`)
                                .setDescription(`Select Role Those Who Responds To Tickets.`)
                                .setRequired(true)))
                .addSubcommandGroup(group =>
                    group.setName(`send`)
                        .setDescription(`Send/Activate Ticket Panel.`)
                        .addSubcommand(subcommand => 
                            subcommand.setName(`panel`)
                                .setDescription(`Send/Activate Ticket Panel.`)))
                .addSubcommandGroup(group =>
                    group.setName(`edit`)
                        .setDescription(`Edit Ticket Configurations.`)
                        .addSubcommand(subcommand =>
                            subcommand.setName(`role`)
                                .setDescription(`Edit Ticket Support Role.`)
                                .addRoleOption(option =>
                                    option.setName(`support_role`)
                                        .setDescription(`Select Role Those Who Responds To Tickets.`)
                                        .setRequired(true)))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`channel`)
                                .setDescription(`Select Channel That You Want To Send Ticket Panel.`)
                                .addChannelOption(option =>
                                    option.setName(`select_channel`)
                                        .setDescription(`Select Channel That You Want To Send Ticket Panel`)
                                        .setRequired(true)
                                        .addChannelTypes(ChannelType.GuildText)))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`category`)
                                .setDescription(`Select Category For Tickets Creation.`)
                                .addChannelOption(option =>
                                    option.setName(`select_category`)
                                        .setDescription(`Select Category For Tickets Creation.`)
                                        .setRequired(true)
                                        .addChannelTypes(ChannelType.GuildCategory)))
                        .addSubcommand(subcommand =>
                            subcommand.setName(`logs`)
                                .setDescription(`Setup Ticket Logs Channel.`)
                                .addChannelOption(option =>
                                    option.setName(`select_logs_channel`)
                                        .setDescription(`Setup Ticket Logs Channel.`)
                                        .setRequired(true)
                                        .addChannelTypes(ChannelType.GuildText))))
                    .addSubcommandGroup(group =>
                        group.setName(`panel-embed`)
                            .setDescription(`Edit Embed In Ticket System.`)
                            .addSubcommand(subcommand =>
                                subcommand.setName(`title`)
                                    .setDescription(`Edit Embed Title In Ticket Panel.`)
                                    .addStringOption(option =>
                                        option.setName(`text`)
                                            .setDescription(`Enter Text That You Want Set As Title Of Panel Embed.`)
                                            .setRequired(true)))
                            .addSubcommand(subcommand =>
                                subcommand.setName(`description`)
                                    .setDescription(`Edit Embed Description In Ticket Panel.`))
                            .addSubcommand(subcommand =>
                                subcommand.setName(`thumbnail`)
                                    .setDescription(`Edit Embed Thumbnail In Ticket Panel.`)
                                    .addStringOption(option =>
                                        option.setName(`url`)
                                            .setDescription(`Enter Url That You Want Set As Thumbnail Of Panel Embed.`)
                                            .setRequired(true))))
                    .addSubcommand(subcommand =>
                        subcommand.setName(`block`)
                            .setDescription(`Block Any User From Creating Ticket.`)
                            .addUserOption(option => 
                                option.setName(`user`)
                                    .setDescription(`Select User You Want To Block.`)
                                    .setRequired(true)))
                    .addSubcommand(subcommand =>
                        subcommand.setName(`unblock`)
                            .setDescription(`UnBlock Blocked User From Creating Ticket.`)
                            .addUserOption(option => 
                                option.setName(`user`)
                                    .setDescription(`Select User You Want To UnBlock.`)
                                    .setRequired(true)))
                    .addSubcommand(subcommand =>
                         subcommand.setName(`delete`)
                            .setDescription(`Delete Ticket System.`)),
			usage: 'ticket',
			category: 'ticket',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links', 'Manage Guild'],
		});
	}
	async run(client, interaction){
        
        const ticketdb = client.quickdb.table(`ticket`)
        const ticketembeddb = client.quickdb.table(`ticketembed`)
        const ticketblockdb = client.quickdb.table(`ticketblock`)
        let ticketcheck = await ticketdb.get(`${interaction.guild.id}`)
        let ticketembedcheck = await ticketembeddb.get(`${interaction.guild.id}`)
        let subcommand = interaction.options.getSubcommand();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "setup"){
            await interaction.deferReply({ ephemeral: true })
            const channel1 =  await interaction.options.getChannel(`channel`);
            const category = await interaction.options.getChannel(`category`);
            const ticketlogs = await interaction.options.getChannel(`ticket_logs`);
            const supportrole = await interaction.options.getRole(`support_role`);

            if(!ticketcheck){
                return await interaction.followUp({ content: `> Done✅. Use "/ticket send panel" Command To Activate/Send Ticket Panel.` }).then(() => {
                    ticketdb.set(interaction.guild.id, {
                        channel: channel1.id,
                        category: category.id,
                        ticketLogs: ticketlogs.id,
                        supportRole: supportrole.id
                    });
                })
            } else if(ticketcheck){
                return await interaction.followUp({ content: `**Note: **To Send Ticket Panel Use "/ticket send panel" Command.\nTicket System Was Already Activated. **Use Below Commands To Edit Ticket System**\n\n> **/ticket edit channel** - Edits Tickets Channel For Panel.\n> **/ticket edit category** - Edits Ticket Creations Category.\n> **/ticket edit logs** - Edits Ticket Logs Channel.\n> **/ticket edit role** - Edits Ticket ssSupport Role.` })
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
        if(subcommand === "panel"){
            await interaction.deferReply({ ephemeral: true });
            if(!ticketcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else if(ticketcheck){
                let channel = await client.functions.ticketPanelSend(interaction, ticketcheck, ticketembedcheck);
                return await interaction.followUp({ content: `> Done✅. Activated/Sent Ticket Panel In ${channel}.` });
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "delete"){
            await interaction.deferReply({ ephemeral: true });
            if(!ticketcheck){
                return await interaction.followUp({ content: `> Ticket System Was Not Setup In Your Guild.`})
            } else if(ticketcheck){
                await ticketdb.delete(`${interaction.guild.id}`);
                return await interaction.followUp({ content: `> Ticket System Was Not Deleted In Your Guild.`})
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "role"){
            await interaction.deferReply({ ephemeral: true });
            if(!ticketcheck){
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else if(ticketcheck){
                let role1 = await interaction.options.getRole(`support_role`);
                let [channel, category, logs, role2] = [ticketcheck.channel, ticketcheck.category, ticketcheck.ticketLogs, ticketcheck.supportRole];
                if(role1.id === role2){
                    await interaction.followUp({ content: `> You Should Provide New Role Inorder To Change Old Role.` });
                } else {
                    ticketdb.set(interaction.guild.id, {
                        channel: channel,
                        category: category,
                        ticketLogs: logs,
                        supportRole: role1.id
                    });
                    const embed = await client.functions.embedBuild().title(`Ticket Role Edited`).thumbnail(`${process.env.thumbnail}`).ibfields(`OldRole`, `<@&${role2}>`, `NewRole`, `${role1}`).footer().build();
                    await interaction.followUp({ embeds: [embed] })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "channel"){
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else if(ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                let [channel2, category, logs, role] = [ticketcheck.channel, ticketcheck.category, ticketcheck.ticketLogs, ticketcheck.supportRole];
                let channel1 = channel(`select_channel`);
                if(channel1.id === channel2){
                    await interaction.followUp({ content: `> You Should Provide New Channel Inorder To Change Old Channel.` })
                } else {
                    ticketdb.set(interaction.guild.id, {
                        channel: channel1.id,
                        category: category,
                        ticketLogs: logs,
                        supportRole: role
                    });
                    const embed = new EmbedBuilder()
                        .setTitle(`Ticket Channel Edited`)
                        .setThumbnail(`${process.env.thumbnail}`)
                        .addFields(
                            { name: `**OldChannel: **`, value: `<#${channel2}>`, inline: true },
                            { name: `**NewChannel: **`, value: `${channel1}`, inline: true },
                        )
                        .setColor(`${process.env.ec}`)
                        .setFooter({
                            text: `${client.user.username} - ${process.env.year} ©`,
                            iconURL: process.env.iconurl
                        });
                    await interaction.followUp({ embeds: [embed] })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "category"){
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else if(ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                let [channel2, category, logs, role] = [ticketcheck.channel, ticketcheck.category, ticketcheck.ticketLogs, ticketcheck.supportRole];
                let channel1 = channel(`select_category`);
                if(channel1.id === category){
                    await interaction.followUp({ content: `> You Should Provide New Category Inorder To Change Old Category.` })
                } else {
                    ticketdb.set(interaction.guild.id, {
                        channel: channel2,
                        category: channel1.id,
                        ticketLogs: logs,
                        supportRole: role
                    });
                    const embed = new EmbedBuilder()
                        .setTitle(`Ticket Category Edited`)
                        .setThumbnail(`${process.env.thumbnail}`)
                        .addFields(
                            { name: `**OldCategory: **`, value: `<#${category}>`, inline: true },
                            { name: `**NewCategory: **`, value: `${channel1}`, inline: true },
                        )
                        .setColor(`${process.env.ec}`)
                        .setFooter({
                            text: `${client.user.username} - ${process.env.year} ©`,
                            iconURL: process.env.iconurl
                        });
                    await interaction.followUp({ embeds: [embed] })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "logs"){
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else if(ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                let [channel2, category, logs, role] = [ticketcheck.channel, ticketcheck.category, ticketcheck.ticketLogs, ticketcheck.supportRole];
                let channel1 = channel(`select_logs_channel`);
                if(channel1.id === logs){
                    await interaction.followUp({ content: `> You Should Provide New Logs Channel Inorder To Change Old Logs Channel.` })
                } else {
                    ticketdb.set(interaction.guild.id, {
                        channel: channel2,
                        category: category,
                        ticketLogs: channel1.id,
                        supportRole: role
                    });
                    const embed = new EmbedBuilder()
                        .setTitle(`Ticket Logs Edited`)
                        .setThumbnail(`${process.env.thumbnail}`)
                        .addFields(
                            { name: `**OldLogs: **`, value: `<#${logs}>`, inline: true },
                            { name: `**NewLogs: **`, value: `${channel1}`, inline: true },
                        )
                        .setColor(`${process.env.ec}`)
                        .setFooter({
                            text: `${client.user.username} - ${process.env.year} ©`,
                            iconURL: process.env.iconurl
                        });
                    await interaction.followUp({ embeds: [embed] })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "block"){
            let user1 = user(`user`);
            let ticketblockarray = await ticketblockdb.get(`${interaction.guild.id}`)
            let ticketblockcheck = Array.isArray(ticketblockarray) ? ticketblockarray : [];
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else {
                try{
                    if(!ticketblockarray.includes(`${user1.id}`)){
                        ticketblockdb.push(`${interaction.guild.id}`, `${user1.id}`)
                        await interaction.deferReply({ ephemeral: true })
                        return await interaction.followUp({ content: `> Done✅. Blocked User From Creating Ticket.` })
                    } else {
                        await interaction.deferReply({ ephemeral: true })
                        return await interaction.followUp({ content: `> The User Was Already Blocked From Making Ticket.` })
                    }
                } catch(e){
                    ticketblockdb.push(`${interaction.guild.id}`, `${user1.id}`)
                    await interaction.deferReply({ ephemeral: true })
                    return await interaction.followUp({ content: `> Done✅. Blocked User From Creating Ticket.` })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "unblock"){
            let user1 = user(`user`);
            let ticketblockarray = await ticketblockdb.get(`${interaction.guild.id}`)
            let ticketblockcheck = Array.isArray(ticketblockarray) ? ticketblockarray : [];
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else {
                try{
                    if(!ticketblockarray.includes(`${user1.id}`)){
                        await interaction.deferReply({ ephemeral: true })
                        return await interaction.followUp({ content: `> The User Was Not Blocked To Unblock.` })
                    } else {
                        let newarray = ticketblockarray.filter(user =>  user != user1.id )
                        ticketblockdb.set(`${interaction.guild.id}`, newarray)
                        await interaction.deferReply({ ephemeral: true })
                        return await interaction.followUp({ content: `> Done✅. Unblocked User From Creating Ticket.` })
                    }
                } catch(e){
                    await interaction.deferReply({ ephemeral: true })
                    return await interaction.followUp({ content: `> The User Was Not Blocked To Unblock.` })
                }
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "title"){
            const title = string(`text`)
            if(title.length > 256){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> Embed Title Can't Be More Than 256 Characters.` })
            } else {
                let thumbnail1 = ticketembedcheck?.thumbnail || null;
				let description1 = ticketembedcheck?.description || null;
                ticketembeddb.set(`${interaction.guild.id}`, {
                    title: title,
                    description: description1,
                    thumbnail: thumbnail1 
                })
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> Done✅. Ticket Panel Embed Title Was Now Updated, Use "/ticket send panel" Command To Send Updated Embed.` })
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "description"){
            const description = new ModalBuilder()
                .setCustomId('myModalDescription')
                .setTitle('Ticket System Configuration.')
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('text')
                                .setLabel("Set Ticket Panel Embed Description.")
                                .setStyle(TextInputStyle.Paragraph)
                        )
                )
            await interaction.showModal(description);
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(subcommand === "thumbnail"){
            const thumbnail = string(`url`)
            let validurl = isValidURL(thumbnail)
            if(!ticketcheck){
                await interaction.deferReply({ ephemeral: true })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else {
                if(validurl === false){
                    await interaction.deferReply({ ephemeral: true })
                    return await interaction.followUp({ content: `> Invlaid Url.` })
                } else if(validurl === true){
                    let title1 = ticketembedcheck?.title || null;
				    let description1 = ticketembedcheck?.description || null;
                    ticketembeddb.set(`${interaction.guild.id}`, {
                        title: title1,
                        description: description1,
                        thumbnail: thumbnail 
                    })
                    await interaction.deferReply({ ephemeral: true })
                    return await interaction.followUp({ content: `> Done✅. Ticket Panel Embed Thumbnail Was Updated, Use "/ticket send panel" Command To Send Updated Embed.` })
                }
            }
        }

//////////////////////////////////////////////////{Functions}//////////////////////////////////////////////////

        function string(text){
            let stringInput = interaction.options.getString(text);
            return stringInput;
        }
        function user(usr){
            let usrInput = interaction.options.getUser(usr);
            return usrInput;
        }
        function channel(chl){
            let chlInput = interaction.options.getChannel(chl);
            return chlInput;
        }
        function integer(int){
            let intInput = interaction.options.getInteger(int);
            return intInput;
        }
        function number(num){
            let numInput = interaction.options.getNumber(num);
            return numInput;
        }
        function role(rle){
            let rleInput = interaction.options.getRole(rle);
            return rleInput;
        }
        function isValidURL(url){
            const pattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
            return pattern.test(url);
        }

//////////////////////////////////////////////////{Functions}//////////////////////////////////////////////////
	}
};