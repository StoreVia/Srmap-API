module.exports = class PlayerEvent {
	constructor(client, options = {}){
		this.client = client;
		this.name = options.name;
	}
	async run(){
		throw new Error(`This Event "${this.name}" Does Not Have A Run Method.`);
	}
};