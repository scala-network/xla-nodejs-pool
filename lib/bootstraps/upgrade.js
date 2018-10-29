const logSystem = 'bootstrap/upgrade';
require('../exceptionWriter.js')(logSystem);
log(logSystem,"Upgrading started");

module.exports = function(callback){

	redisClient.hget(config.coin+":application",'version',function(err,version){

		if(err){
			version = "";
		}
		log(logSystem,"Database version is "+version);
		if(version === global.version){
			log(logSystem,"Database already upgraded to "+global.version);
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
		log(logSystem,"No upgrade for "+global.version);
		callback();
	});
};