const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const CommandHandler = require('../handler/Command');
const EventHandler = require('../handler/Event');
const Functions = require('../handler/Functions');
const { QuickDB, JSONDriver } = require("quick.db");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const { MongoClient } = require('mongodb');

module.exports = class BotClient extends Client {
	constructor(...opt){
		super({
			opt,
			partials: [
				Partials.GuildMember,
				Partials.Message,
				Partials.Channel,
				Partials.User
			],
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildMessageTyping,
				GatewayIntentBits.GuildInvites,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageTyping,
				GatewayIntentBits.DirectMessageTyping,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildVoiceStates,
			],
		});
		
		["Command", "Event", "RegisterSlash"].filter(Boolean).forEach(h => {require(`../handler/${h}`)});
		this.commands = new Collection();
		this.aliases = new Collection();
		this.categories = require("fs").readdirSync(`./commands`);
		this.events = new Collection();
		this.quickdb = new QuickDB({ driver: new JSONDriver });
		this.functions = new Functions(this);
		this.mongoClient = new MongoClient(process.env.server); 

		new CommandHandler(this).build('../commands');
		new CommandHandler(this).build('../devcommands');
	}

	async connectMongoDBAndLoadEvents() {
		try {
			await this.mongoClient.connect();
			console.log("✅ Connected To MongoDB.");
			this.db = this.mongoClient.db("college_db").collection("users");
			new EventHandler(this).build('../events');
		} catch (error) {
			console.error("❌ MongoDB Connection Error: ", error);
		}
	}

	async login(){
		await this.connectMongoDBAndLoadEvents();
		await super.login(process.env.token);
	}

	exit(){
		if(this.quitting) return;
		this.quitting = true;
		this.destroy();
	}

	fetchSlashCommand(cmd){
		return this.commands.get(cmd);
	}

	fetchMessageCommand(cmd){
		return this.messagecommands.get(cmd);
	}
};