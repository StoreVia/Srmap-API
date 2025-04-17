const Event = require('../../structures/Events/EventClass');

module.exports = class GuildMemberAdd extends Event {
	constructor(client){
		super(client, {
			name: 'guildMemberRemove',
			category: 'guild',
		});
	}
	async run(member){

        const client = this.client;

        const leavesetdb = client.quickdb.table(`leave`);
        const leavesetcheck = await leavesetdb.get(`${member.guild.id}`); 
        const leaveconfigurationdb = client.quickdb.table(`leaveconfiguration`);
        const leaveconfigurationdbcheck = await leaveconfigurationdb.get(`${member.guild.id}`);

        if(!leavesetcheck){
            return;
        }
        if(leavesetcheck){
            let text = leaveconfigurationdbcheck || "<MemberMention>, Just Left The Server."
            const text1 = text.replace('<MemberMention>', `${member}`)
                .replace('<MemberCount>', `${member.guild.memberCount}`)
                .replace('<UserName>', `${member.user.username}`)
                .replace('<UserId>', `${member.user.id}`)
                .replace('<UserTag>', `${member.user.discriminator}`)
                .replace('<ServerName>', `${member.guild.name}`)
                .replace('<ServerId>', `${member.guild.id}`);
            client.channels.cache.get(leavesetcheck).send({ content: `${text1}`})
        }
	}
};