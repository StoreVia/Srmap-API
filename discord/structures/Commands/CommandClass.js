module.exports = class Command {
    constructor(client, meta = {}){
        this.client = client;
        this.data = meta.data;
        this.contextDescription = meta.contextDescription || null;
        this.usage = meta.usage || this.name;
        this.category = meta.category || 'Info';
        this.allowed = meta.allowed || [];
        this.permissions = meta.permissions || ['Use Application Commands', 'Send Messages', 'Embed Links'];
    }
    async autocomplete(){
        throw new Error(`The Slash Command ${this.name} Doesn't Have Any Autocomplete Method.`);
    }
    async run(){
        throw new Error(`The Slash Command ${this.name} Doesn't Have Any Run Method.`);
    }
};
