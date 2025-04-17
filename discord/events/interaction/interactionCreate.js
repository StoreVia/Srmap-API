const Event = require('../../structures/Events/EventClass');
const { InteractionType, MessageFlags, EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getPasteUrl, PrivateBinClient } = require('@agc93/privatebin');

module.exports = class InteractionCreate extends Event {
	constructor(client){
		super(client, {
			name: 'interactionCreate',
			category: 'guild',
		});
	}
	async run(interaction){

		const client = this.client;
		
//commandruneventstart
		if(interaction.type === InteractionType.ApplicationCommand){
			const command = client.commands.get(interaction.commandName);
			if(interaction.user.bot){
				return;
			}
			if(!interaction.inGuild() && interaction.type === InteractionType.ApplicationCommand){
				await interaction.deferReply();
				return await interaction.followUp({ content: '> Slash Commands Can Only Be Used In Server/Guilds.' });
			}
			if(!command){
				await interaction.deferReply();
				return await interaction.followUp({ content: `> This Isn't Avilable For Now.`, flags: MessageFlags.Ephemeral }) && client.commands.delete(interaction.commandName);
			}
			try {
				console.log(`"${command.name}" Command Is Used By ${interaction.user.username}`)
				command.run(client, interaction);
			} catch (e){
				console.log(e);
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				return await interaction.followUp({ content: `> An Error Has Occured.` });
			}
		} else if(interaction.isAutocomplete()){
			const command = interaction.client.commands.get(interaction.commandName);
			if(!command){
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				await command.autocomplete(client, interaction);
			} catch (error){
				console.error(error);
			}
		}
//commandruneventend

//attendancestart
		if (interaction.customId == "bunkModal") {
			const userBunks = parseInt(interaction.fields.getTextInputValue("bunkCount"));
			if (isNaN(userBunks) || userBunks < 0) {
				return interaction.reply({ content: "❌ Please Enter A Valid Number.", flags: MessageFlags.Ephemeral });
			}
			const embed = interaction.message.embeds[0];
			const description = embed.description;
			const classesConducted = parseInt(description.match(/Classes Conducted:- \*\*(\d+)\*\*/)[1]);
			const present = parseInt(description.match(/Present:- \*\*(\d+)\*\*/)[1]);
			const absent = parseInt(description.match(/Absent:- \*\*(\d+)\*\*/)[1]);
			const newClassesConducted = classesConducted + userBunks;
			const newAbsent = absent + userBunks;
			const newPresent = present;
			const newAttendancePercentage = ((newPresent / newClassesConducted) * 100).toFixed(2);
			const maxBunkable = Math.max(0, Math.floor((0.25 * newClassesConducted - newAbsent) / 0.75));
			const requiredAttendance = Math.ceil(newAbsent / 0.25);
			const classesNeeded = Math.max(0, requiredAttendance - newClassesConducted);
			const updatedEmbed = new EmbedBuilder()
				.setTitle(embed.title)
				.setAuthor(embed.author)
				.setDescription(
					`> Attendance:- **${newAttendancePercentage}%**\n` +
					`> Classes Conducted:- **${newClassesConducted}**\n` +
					`> Present:- **${newPresent}**\n` +
					`> Absent:- **${newAbsent}**`
				)
				.setThumbnail(embed.thumbnail.url)
				.addFields(
					{ name: 'ClassesCanBunk', value: `> ${maxBunkable}`, inline: true },
					{ name: 'ClassesNeededFor(75%)', value: `> ${classesNeeded}`, inline: true }
				)
				.setColor(embed.color);
			return interaction.update({ embeds: [updatedEmbed] });
		}
//attendanceend

//welcomestart
		const welcomeconfigurationdb = client.quickdb.table(`welcomeconfiguration`);
		const welcomedmconfigurationdb = client.quickdb.table(`welcomedmconfiguration`);
		const welcomeconfigurationcheck = await welcomeconfigurationdb.get(`${interaction.guild.id}`);
		const welcomedmconfigurationcheck = await welcomedmconfigurationdb.get(`${interaction.guild.id}`);

		if(interaction.customId === 'myModalWelcomeTextEdit'){
			const text1 = interaction.fields.getTextInputValue('text1');
			await interaction.reply({ content: `> Done✅. Welcome Channel Text Now Updated.`, flags: MessageFlags.Ephemeral })
			.then(async() => {
				let background = welcomeconfigurationcheck?.thumbnail || null;
				let color1 = welcomeconfigurationcheck?.color || null;
                await welcomeconfigurationdb.set(`${interaction.guild.id}`, {
                    text: text1,
                    color: color1,
                    thumbnail: background 
                })
			})
		}
		if(interaction.customId === 'myModalDmUserTextEdit'){
			const text3 = interaction.fields.getTextInputValue('text3');
			await interaction.reply({ content: `> Done✅. Welcome Text Message Was Now Updated In Dm.`, flags: MessageFlags.Ephemeral })
			.then(async() => {
				let background = welcomedmconfigurationcheck?.thumbnail || null;
				let color1 = welcomedmconfigurationcheck?.color || null;
                await welcomedmconfigurationdb.set(`${interaction.guild.id}`, {
                    text: text3,
                    color: color1,
                    thumbnail: background 
                })
			})
		}
//welcomeend

//leavestart
		const leaveconfigurationdb = client.quickdb.table(`leaveconfiguration`);
		if(interaction.customId === "myModalLeaveEditText"){
			const text1 = interaction.fields.getTextInputValue('text1');
			await interaction.reply({ content: `> Done✅. User Leave Text Was Now Updated.`, flags: MessageFlags.Ephemeral })
			.then(() => {
				leaveconfigurationdb.set(`${interaction.guild.id}`, text1)
			})
		}
//leaveend

//feedbackstart
	if (interaction.customId === "autofd") {
		const fbdb = client.quickdb.table(`fboption`);
		const queueDb = client.quickdb.table(`feedbackqueue`);
		const queueDbSub = client.quickdb.table(`feedbackqueuesub`);
		const fb = await fbdb.get(`1`);
		if (fb) {
			await interaction.deferReply({ ephemeral: true });
			const credentials = await client.quickdb.get(`user_${interaction.user.id}`);
			if (!credentials) {
				return interaction.followUp({ content: `❌ Use "/login" Command To Use This Command.` });
			}
			const { un, pass } = credentials;
			const credentialsSub = await queueDb.get(`${interaction.user.id}`);
			let submitted = await queueDbSub.get(`users`) || [];
			if(submitted.includes(un)){
				return interaction.followUp({ content: `⚠️ Your Feedback Has Already Submitted.`});
			} else if (!credentialsSub) {
				await queueDb.set(`${interaction.user.id}`, { un: un, pass: pass });
				return interaction.followUp({ content: `✅ Added You To FeedBack List Queue! You Will Be Notified In Discord After Submitting Feedback.`});
			} else if(credentialsSub) {
				return interaction.followUp({ content: `⚠️ You Are Already In Queue Pls Wait Until Your Turn Comes. After Feedback Submitted We Will Inform You.`});
			}
			return interaction.followUp({ content: `❌ Try Again (or) Check Credentials And Login With Proper Credentials Using "/login" Command Again.` });
		} else {
			await interaction.deferReply({ ephemeral: true });
			return interaction.followUp({ content: "❌ This Option Isn't Enabled Yet. Please Wait A Few Hours." });
		}
	}
//feedbackend

//privateslashstart
		if(interaction.customId === "myUpdate"){
			await interaction.reply({ content: `> Done✅. Update Text To Database.`, flags: MessageFlags.Ephemeral })
			.then(async() => {
				let updatecheck = await client.quickdb.get(`update`)
				let updateid = rand.generate(10)
				const updatetext = interaction.fields.getTextInputValue('text');
				if(updatecheck){
					client.quickdb.set(`update`, { textandid: `${updatetext}, ${updateid}`})
				} else if(!updatecheck){
					client.quickdb.set(`update`, { textandid: `${updatetext}, ${updateid}`})
				}
			})
		}
//privateslashend

//ticketstart
		const ticketdb = client.quickdb.table(`ticket`)
		const ticketblockdb = client.quickdb.table(`ticketblock`)
		let ticketcheck = await ticketdb.get(`${interaction.guild.id}`)
		let ticketblockcheck = await ticketblockdb.get(`${interaction.guild.id}`)
		let ticketblockarray = Array.isArray(ticketblockcheck) ? ticketblockcheck : [];

		if(interaction.customId === 'ticketopen'){
			if(!ticketcheck){
				if(interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)){
					await interaction.deferReply({ flags: MessageFlags.Ephemeral })
					return await interaction.followUp({ content: `> Ticket System Was Not Setup. Use "/ticket setup" To Setup Ticket System.` })
				} else {
					await interaction.deferReply({ flags: MessageFlags.Ephemeral })
					return await interaction.followUp({ content: `> This Guild Didn't Setup Ticket System. Please Contact Mod.` })
				}
			 } else if(ticketcheck){
				await interaction.deferReply({ flags: MessageFlags.Ephemeral })
				try{
					if(ticketblockcheck.includes(`${interaction.user.id}`)){
						await interaction.followUp({ content: `> You Are Blocked From Creating Ticket.` })
					} else if(!ticketblockcheck.includes(`${interaction.user.id}`)){
						ticketOpen()
					}
				} catch(e){
					ticketOpen()
				}
			}
		}
		if(interaction.customId === "closeticket"){
			const role = ticketcheck.supportRole;
			const row = new ActionRowBuilder()
				.addComponents(
		 			new ButtonBuilder()
						.setLabel('Continue')
						.setEmoji(`✅`)
						.setCustomId('ticontinue')
						.setStyle(ButtonStyle.Success),
		  			new ButtonBuilder()
						.setLabel('Stop')
						.setCustomId('tistop')
						.setStyle(ButtonStyle.Danger),
				);
			await interaction.deferReply()
			await interaction.followUp({ content: `<@&${role}>, ${interaction.user} Has Requested For Closing Ticket Please Confirm Before Deleting.`, components: [row]})
  		}
		if(interaction.customId === "ticontinue"){
			const role = ticketcheck.supportRole;
			const logs = ticketcheck.ticketLogs;
			const guild = client.guilds.cache.get(interaction.guild.id);
			const logschannel = guild.channels.cache.get(logs);
			if(!interaction.member.roles.cache.has(`${role}`)){
				await interaction.deferReply({ flags: MessageFlags.Ephemeral })
				await interaction.followUp({ content: `> You Don't Have Permission\n> Require <@&${role}>.` })
		  	} else if(interaction.member.roles.cache.has(`${role}`)){
				if(!ticketcheck){
					await interaction.deferReply({ flags: MessageFlags.Ephemeral })
					if(interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)){
						return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
					} else {
						return await interaction.followUp({ content: `> This Guild Doesn't Have Active Ticket System. Please Contact Mod.` })
					}
				} else if(ticketcheck){
					await interaction.deferReply()
					await interaction.followUp({ content: `> Saving Messages Please Wait...` })

					interaction.channel.messages.fetch().then(async (messages) => {
						let a = messages.filter(m => m.author.bot !== true).map(m =>
							`\n ${new Date(m.createdTimestamp).toLocaleString('en-EN')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
						).reverse().join('\n');
						if(a.length < 1) a = "Nothing"
						var paste = new PrivateBinClient("https://privatebin.net/");
						var result = await paste.uploadContent(a, {uploadFormat: 'markdown'})

						const embed = new EmbedBuilder()
							.setTitle('Ticket Logs')
							.setDescription(`To See Logs Of The Ticket Created By <@!${interaction.channel.topic}> [ClickHere](${getPasteUrl(result)})`)
							.addFields(
								{ name: `**CreatedBy: **`, value: `<@!${interaction.channel.topic}>`, inline: true },
								{ name: `**ClosedBy: **`, value: `<@!${interaction.user.id}>`, inline: true }
								)
								.setColor(`${process.env.ec}`)
								.setFooter({
									text: `Link Expires In 6 Days From Now.`,
									iconURL: process.env.iconurl
								})
								.setTimestamp();

						logschannel.send({ embeds: [embed] }).then(() => {
							interaction.channel.delete()
						})
					}).catch(async(e) => {
						console.log(e)
						const embed = new EmbedBuilder()
							.setTitle('Ticket Logs')
							.setDescription(`Error In Creating Logs, Please Try Later. **If You Think This Is A Bug PleaseReport By Using "/report" Command.**`)
							.addFields(
								{ name: `**CreatedBy: **`, value: `<@!${interaction.channel.topic}>`, inline: true },
								{ name: `**ClosedBy: **`, value: `<@!${interaction.user.id}>`, inline: true }
							)
							.setColor(`${process.env.ec}`)
							.setFooter({
								text: `Link Expires In 6 Days From Now.`,
								iconURL: process.env.iconurl
							})
							.setTimestamp();

						logschannel.send({ embeds: [embed] }).then(() => {
							interaction.channel.delete();
				  		})
			  		})
				}
		  	}
  		}
		if(interaction.customId === "tistop"){
			interaction.message.delete();
		}
		if(interaction.customId === "myModalDescription"){
			const description = interaction.fields.getTextInputValue('text');
			const ticketdb = client.quickdb.table(`ticket`)
        	const ticketembeddb = client.quickdb.table(`ticketembed`)
        	let ticketcheck = await ticketdb.get(`${interaction.guild.id}`)
        	let ticketembedcheck = await ticketembeddb.get(`${interaction.guild.id}`)
            if(!ticketcheck){
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                return await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
            } else {
				let title1 = ticketembedcheck?.title || null;
				let thumbnail12 = ticketembedcheck?.thumbnail || null;
                ticketembeddb.set(`${interaction.guild.id}`, {
                    title: title1,
                    description: description,
                    thumbnail: thumbnail12
                })
                return await interaction.reply({ content: `> Done✅. Ticket Panel Description Title Was Now Set, Use "/ticket send panel" Command To Send Updated Embed.`, flags: MessageFlags.Ephemeral })
            }
		}
//ticketend
		

//////////////////////////////////////////////////{Functions}//////////////////////////////////////////////////

		async function ticketOpen(){
			const role = ticketcheck.supportRole;
			const category1 = ticketcheck.category;
			const category = client.channels.cache.get(category1)
			const channelcheck = interaction.member.guild.channels.cache.find(channel => channel.name === `${interaction.user.username.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '')}_${interaction.user.id}`);
			if(!ticketcheck){
				await interaction.followUp({ content: `> You Have Not Setup Ticket System Yet. Use "/ticket setup" Command To Setup Ticket System.` })
			} else if(channelcheck){
				await interaction.followUp({ content: `> You Have Already An Open Ticket.` });
			} else {
				await interaction.guild.channels.create({
					name: `${interaction.user.username}_${interaction.user.id}`,
					type: ChannelType.GuildText,
					parent: category,
					topic: `${interaction.user.id}`,
					permissionOverwrites: [
						{
							id: interaction.guild.roles.everyone.id,
							deny: [PermissionsBitField.Flags.ViewChannel]
						},
						{
							id: interaction.user.id,
							allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
						},
						{
							id: role,
							allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
						}
					 ]
				}).then( async (channel) => {
					await interaction.followUp({ content: `Done✅. Check Out ${channel}.` })

					const buttonRow = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setLabel('Close')
								.setCustomId('closeticket')
								.setStyle(ButtonStyle.Danger),
						)
					const embed = new EmbedBuilder()
						.setAuthor({
							name: `${interaction.user.tag}`,
							iconURL: `${interaction.user.displayAvatarURL({ extension: "png"})}`
						})
						.setTitle(`Ticket Opened`)
						.setDescription(`Please Wait Our Staff Will Arrive Soon To Help You.`)
						.setColor(`${process.env.ec}`)
						.setFooter({
							text: `${client.user.username} - ${process.env.year} ©`,
							iconURL: process.env.iconurl
						})
					channel.send({ content: `<@&${role}>, ${interaction.user} Created Ticket!`, embeds: [embed], components: [buttonRow] })
				})
			}
		}

//////////////////////////////////////////////////{Functions}//////////////////////////////////////////////////

	}
};