const utils = require('../utils.js');


const logSystem = 'api/scoresheets';
require('../exceptionWriter.js')(logSystem);
let avaliableHeights = {};
let currentRound;

module.exports = {
	/**
 * Return blocks scoresheet for miner
 **/
	miner:function(urlParts, response){
	    var id = urlParts.query.address;
	    const redisQuery = [];
	    if(!utils.validateMinerAddress(id)){
	        return sendData(response,{error:"Invalid wallet address"});
	    }

	    var height = urlParts.query.height || null;
	    redisClient.hkeys(config.coin + ':block_histories:'+id,function(e,r){
	        if(e){
	            return sendData({error: 'Query failed'});
	        }
	        if(r.length < 1){
	            return sendData(response,{error: 'No height found for miner'});
	        }
	        r = r.reverse();
	        if(!height){
	            height = r[0];
	        }
	        if(r.indexOf(height) < 0){
	            return sendData(response,{heights:r,error: 'Invalid height'});
	        }

	        let page = urlParts.query.page || false;

	        if(!page){
	            redisClient.hget(config.coin + ':block_histories:'+id,height,function(er,replies){
	                if(er){
	                    return sendData({error: 'Query failed'});
	                }
	                return sendData(response,{data:JSON.parse(replies)});
	            });
	            return;
	        }
	        page = parseInt(page);
	        const limit = 30;
	        const page_count = Math.ceil(r.length/limit);
	        if(page > page_count || page < 1){
	            return sendData({page:{count:page_count,limit:limit,page:page,error:'Invalid page number'}});
	        }

	        const start = page_count * limit;
	        const end = limit;
	        const nextSeqCount = start + limit;//30 + 30 = 60
	        if(nextSeqCount > r.length){//60 > 50
	            end = r.length - start;// r.length - start = 50 - 30 = 20 to cut
	        }
	        
	        var redisCmds = r.slice(start, end).map(function(k){
	            return [config.coin + ':block_histories:'+id,k];
	        });

	        redisClient.multi(redisCmds,function(er,replies){
	            if(er){
	                return sendData({message: 'Query failed',status:"error"});
	            }

	            return sendData({page:{count:page_count,limit:limit,page:page,data:replies}});
	        });
	    });
	},
/**
 * Return blocks scoresheet for pool
 **/
	pool:function(urlParts, response){
	    var height = urlParts.query.height || "Current";
	    if(height !== "Current"){
	        height = parseInt(height)+"";
	    }
	    if(height.toLowerCase() == "current"){
	        height = "Current";
	    }
	    if(height === "Current"){
	    	return sendData(response,{data:currentRound});
	    }
	    if(avaliableHeights.hasOwnProperty(height) >=0){
	    	return sendData(response,{data:avaliableHeights[height],status:'success'});
	    }
        redisClient.hgetall(config.coin + ':block_shares:'+height,function(error,replies){
        	if(error){
        		return sendData(response,{
        			status:"error",
        			message:"Invalid height"
        		});
        	}

            let o = {};
            for(let wallet in replies){
                if(utils.validateMinerAddress(miner)){
                    wallet = utils.truncateAddress(wallet);
                }
                o[wallet] = JSON.parse(replies[wallet]);
            }
            avaliableHeights[height] = o;
            sendData(response,{data:o,status:'success'});
        });
	},
	setCurrentRound:function(data){
		currentRound=data;
	}
}