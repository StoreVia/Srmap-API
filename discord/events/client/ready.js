const Event = require('../../structures/Events/EventClass');
const colors = require(`colors`);

module.exports = class ReadyEvent extends Event {
	constructor(client){
		super(client, {
			name: 'ready',
			once: true,
		});
	}
	async run(){
		const client = this.client;
		this.setStatus(client);
		setInterval(async() => {
			this.setStatus(client);
		}, 300000);
		console.log(colors.red(`Discord Bot Is Now Online.`));
		this.processFeedbackQueue(client)
		
	}
	async setStatus(client){
		const users = await client.db.countDocuments();
		client.user.setPresence({
			activities: [{ name: `${users} Users...`, type: 3 }],
			status: 'online',
		});
	}
	async processFeedbackQueue(client) {
		const queueDb = client.quickdb.table('feedbackqueue');
		const queueDbSub = client.quickdb.table('feedbackqueuesub');
		while (true) {
			const pendingUsers = await queueDb.all();
			if (pendingUsers.length) {
				for (const userEntry of pendingUsers) {
					const userId = userEntry.id;
					const { un, pass } = userEntry.value;
	
					try {
						const response = await fetch(`http://srmapi.vercel.app/feedback?username=${un}&password=${pass}`);
						const data = await response.json();
						const user = await client.users.fetch(userId);
						if (data.success) {
							console.log(colors.green(`✅ Feedback submitted for ${un}`));
							await queueDb.delete(userId);
							let submittedUsers = (await queueDbSub.get('users')) || [];
							submittedUsers.push(un);
							await queueDbSub.set('users', submittedUsers);
							user.send({ content: `Your feedback was submitted! If it wasn’t, contact support using "/report".` });
						} else {
							console.log(data)
							if (data.errorCode === "1") {
								console.log(colors.green(`✅ Feedback was already submitted for ${un}`));
								await queueDb.delete(userId);
								let submittedUsers = (await queueDbSub.get('users')) || [];
								submittedUsers.push(un);
								await queueDbSub.set('users', submittedUsers);
								user.send({ content: `⚠️ Your feedback was already submitted! If you think this is a mistake, use "/report".` });
							} else if (data.errorCode === "2") {
								await queueDb.delete(userId);
								user.send({ content: `❌ Login failed. Please check your credentials and try "/login". If this is an issue, report it with "/report".` });
							}
						}
					} catch (error) {
						console.error(colors.red(`❌ Error processing feedback for ${un}:`), error);
					}
	
					await new Promise(res => setTimeout(res, 2000));
				}
			} else {
				await new Promise(res => setTimeout(res, 5000));
			}
		}
	}
};