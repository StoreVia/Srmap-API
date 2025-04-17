const ProcessEvent = require('../../structures/Events/ProcessEventClass');

module.exports = class UnhandledRejection extends ProcessEvent {
	constructor(client){
		super(client, {
			name: 'unhandledRejection',
			category: 'process',
		});
	}
	async run(reason, p){
        
        console.log(' [ AntiCrashDetection ]: Unhandled Rejection/Catch');
        console.log(reason, p);
		
	}
};