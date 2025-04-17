const Event = require('../../structures/Events/EventClass');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);

module.exports = class GuildMemberAdd extends Event {
	constructor(client){
		super(client, {
			name: 'guildMemberAdd',
			category: 'guild',
		});
	}
	async run(member){

		const client = this.client;

        const welcomesetdb = client.quickdb.table(`welcome`);
		const welcomeconfigurationdb = client.quickdb.table(`welcomeconfiguration`);
		const welcomedmdb = client.quickdb.table(`welcomedm`);
		const welcomedmconfigurationdb = client.quickdb.table(`welcomedmconfiguration`);
		const welcomesetcheck = await welcomesetdb.get(`${member.guild.id}`);
		const welcomeconfigurationcheck = await welcomeconfigurationdb.get(`${member.guild.id}`);
		const welcomedmcheck = await welcomedmdb.get(`${member.guild.id}`);
		const welcomedmconfigurationcheck = await welcomedmconfigurationdb.get(`${member.guild.id}`);

        if(welcomedmcheck){
            let dmtext = (welcomedmconfigurationcheck && welcomedmconfigurationcheck.text) ? welcomedmconfigurationcheck.text : "<MemberMention>, Welcome To <ServerName>.";
            let color = (welcomedmconfigurationcheck && welcomedmconfigurationcheck.color) ? welcomedmconfigurationcheck.color : "FFFFFF";
            let backgroundurl = (welcomedmconfigurationcheck && welcomedmconfigurationcheck.thumbnail) ? welcomedmconfigurationcheck.thumbnail : "https://i.pinimg.com/originals/fa/ab/f0/faabf039c3c9d50462c2e2dd660edd04.jpg";
            const row = new ActionRowBuilder()
			    .addComponents(
				    new ButtonBuilder()
					    .setCustomId('welcome_dm')
					    .setLabel(`From Server: ${member.guild.name}`)
                        .setDisabled(true)
					    .setStyle(ButtonStyle.Secondary),
			    );
            const text1 = dmtext.replace('<MemberMention>', `${member}`)
                .replace('<MemberCount>', `${member.guild.memberCount}`)
                .replace('<UserName>', `${member.user.username}`)
                .replace('<UserId>', `${member.user.id}`)
                .replace('<UserTag>', `${member.user.discriminator}`)
                .replace('<ServerName>', `${member.guild.name}`)
                .replace('<ServerId>', `${member.guild.id}`);
            
            member.send({ content: `${text1}`, files: [{ attachment: `https://api.gamecord.xyz/welcomecard?avatar=${member.user.displayAvatarURL({ dynamic: true, size: 4096, extension: "jpg" })}&name=${member.user.username}&title=Welcome&message=${member.guild.memberCount}th Member&background=${await backgroundurl}&textcolor=${await color}&avatarcolor=${await color}`, name: 'image.png'}], components: [row]})
        }

        if(welcomesetcheck){
            let text2 = (welcomeconfigurationcheck && welcomeconfigurationcheck.text) ? welcomeconfigurationcheck.text : "<MemberMention>, Welcome To <ServerName>.";
            let color = (welcomeconfigurationcheck && welcomeconfigurationcheck.color) ? welcomeconfigurationcheck.color : "FFFFFF";
            let backgroundurl = (welcomeconfigurationcheck && welcomeconfigurationcheck.thumbnail) ? welcomeconfigurationcheck.thumbnail : "https://i.pinimg.com/originals/fa/ab/f0/faabf039c3c9d50462c2e2dd660edd04.jpg";
            const text1 = text2.replace('<MemberMention>', `${member}`)
                .replace('<MemberCount>', `${member.guild.memberCount}`)
                .replace('<UserName>', `${member.user.username}`)
                .replace('<UserId>', `${member.user.id}`)
                .replace('<UserTag>', `${member.user.discriminator}`)
                .replace('<ServerName>', `${member.guild.name}`)
                .replace('<ServerId>', `${member.guild.id}`);
    
            client.channels.cache.get(welcomesetcheck).send({ content: `${text1}`, files: [{ attachment: `https://api.gamecord.xyz/welcomecard?avatar=${member.user.displayAvatarURL({ dynamic: true, size: 4096, extension: "jpg" })}&name=${member.user.username}&title=Welcome&message=${member.guild.memberCount}th member&background=${await backgroundurl}&textcolor=${await color}&avatarcolor=${await color}`, name: 'image.png'}]})
        }
	}
};