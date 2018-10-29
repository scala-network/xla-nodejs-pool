const logSystem = 'bootstrap/upgrade/v1.4.5';
require('../../exceptionWriter.js')(logSystem);


module.exports = function(version,callback){
	redisClient.keys(config.coin + ':block_histories:*',function(e,r){

        if(e || r.length < 1){
        	log("info",logSystem,"No block histories for "+version);
            return callback();
        }

        const redisCmds = [];

        // r = Stellitecoin:block_histories:Se4FFaA4n89epNPA7bXgzaFBup9a4wDABbYsEQXDWGiFNdbnwgmBoLgjXSX7ZHSnpCcie1uMmEZ7K2xaVbdsyxkc32AEBDr1p
       	r.map(function(table){
       		log("info",logSystem,"Getting keys "+table);
        	const tablekeys = table.split(":");
        	const miner = tablekeys[tablekeys.length -1];

            redisClient.hkeys(table,function(er,keys){
	            if(er){
	            	return callback();
	            }
	            //keys returns height
	            var cmds = keys.map(function(mapKey){
	            	log("info",logSystem,"Getting keys %s hkeys %s",[table,mapKey]);
	            	redisClient.hget(tablekeys,mapKey,function(err,reply){
	            		if(!err){

	            			//replies = "{\"score\":18246,\"percent\":0.05176463912846119,\"earn\":102277.94482,\"donate\":1022.77945,\"bonus\":0}"
	            			redisCmds.push(['zadd',config.coin + ':block_scores:'+miner,mapKey,reply]);	
	            		}

	            		return 0;
		            });
	            });
	        });
        });

        redisCmds.push(['hset',config.coin+":application",version,"1.4.5"]);
        redisClient.multi(redisCmds,function(e,r){
			callback();
		});
    });

    return 0;
};