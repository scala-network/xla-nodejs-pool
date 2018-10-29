const logSystem = 'bootstrap/upgrade';
require('../exceptionWriter.js')(logSystem);


module.exports = function(callback){
	log("info",logSystem,"Upgrading started");
	redisClient.hget(config.coin+":application",'version',function(err,version){

		if(err || version == null){
			version = "";
		}

		log("info",logSystem,"Database version is "+version);
		if(version === global.version){
			log("info",logSystem,"Database already upgraded to "+global.version);
			callback();
			return;
		}

		switch(global.version){
			case "1.4.5":
				if(version === "1.4.4" || version === ""){
					log("info",logSystem,"Running upgrade to "+global.version);
					return require('./upgradeHandlers/v1.4.5')(version,callback);
				}
			break;
			default:
			break;
		}		
		log("info",logSystem,"No upgrade for "+global.version);
		callback();
	});
};