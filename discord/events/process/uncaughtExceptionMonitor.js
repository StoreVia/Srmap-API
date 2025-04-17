const ProcessEvent = require('../../structures/Events/ProcessEventClass');

module.exports = class UncaughtExceptionMonitor extends ProcessEvent {
	constructor(client){
		super(client, {
			name: 'uncaughtExceptionMonitor',
			category: 'process',
		});
	}
	async run(err, origin){
        
        console.log(' [ AntiCrashDetection ]: Uncaught Exception/Catch (MONITOR)');
        console.log(err, origin);
		
	}
};