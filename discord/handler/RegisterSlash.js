const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
require('dotenv').config();

const deploy = async () => {
	const commandData = [];
	const devCommandData = [];

	const loadCommands = (directory, dataArray) => {
		const categories = fs.readdirSync(directory);
		for (const category of categories) {
			const commands = fs.readdirSync(`${directory}/${category}`).filter(cmd => cmd.endsWith('.js'));
			for (const command of commands) {
				const Command = require(`../${directory}/${category}/${command}`);
				const cmd = new Command();
				dataArray.push(cmd.data.toJSON());
			}
		}
	};

	loadCommands('./commands', commandData);
	loadCommands('./devcommands', devCommandData);

	const rest = new REST({ version: '10' }).setToken(process.env.token);
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.clientId, process.env.devGuildId),
			{ body: devCommandData }
		);
		await rest.put(
			Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
			{ body: commandData }
		);
		console.log('✅ Slash Commands Registered.');
	} catch (e) {
		console.error('Error registering commands:', e);
	}
};

deploy();
