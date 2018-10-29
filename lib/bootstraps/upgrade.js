const logSystem = 'bootstrap/upgrade';
require('../exceptionWriter.js')(logSystem);

module.exports = function(callback){
	log(logSystem,"Upgrading started");

	redisClient.hget(config.coin+":application",'version',function(err,version){
		if(err){
			version = "";
		}
		if(version === global.version){
			log(logSystem,"Database already upgraded to "+version);
			callback();
			return;
		}

		switch(global.version){
			case "1.4.5":
				if(version === "1.4.4" || version === ""){
					return require('./upgradeHandlers/v1.4.5')(version,callback);
				}
			break;
			default:
			break;
		}		
		log(logSystem,"No upgrade for "+version);
		callback();
	});
};