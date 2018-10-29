const utils = require('../utils.js');


const logSystem = 'api/scoresheets';
require('../exceptionWriter.js')(logSystem);
let avaliableHeights = {};
let currentRound;

module.exports = {
	/**
 * Return blocks scoresheet for miner
 **/
	 minerByBlock:function(urlParts, sendData){
		    var id = urlParts.query.address;
		    
		    if(!utils.validateMinerAddress(id)){
		        return sendData({error:"Invalid wallet address"});
		    }

		    var height = urlParts.query.height || null;
		    
	        redisClient.hgetall(config.coin + ':block_histories:'+id,parseInt(height),function(er,replies){
	            if(er){
	                return sendData({message: 'Query failed',status:"error"});
	            }

	            return sendData({count:page_count,page:page,data:replies,status:'success'});
	        });
		},
	miner:function(urlParts, sendData){
	    var id = urlParts.query.address;
	    const redisQuery = [];
	    if(!utils.validateMinerAddress(id)){
	        return sendData({error:"Invalid wallet address"});
	    }

	    var height = urlParts.query.height || null;


	    redisClient.hkeys(config.coin + ':block_histories:'+id,function(e,r){
	        if(e){
	            return sendData({error: 'Query failed'});
	        }
	        if(r.length < 1){
	            return sendData({error: 'No height found for miner'});
	        }
	        r = r.reverse();
	        if(!height){
	            height = r[0];
	        }
	        if(r.indexOf(height) < 0){
	            return sendData(response,{message: 'Invalid height',status:'error'});
	        }

	        let page = urlParts.query.page || false;

	        if(!page){
	            redisClient.hget(config.coin + ':block_histories:'+id,height,function(er,replies){
	                if(er){
	                    return sendData({message: 'Query failed',status:'error'});
	                }
	                return sendData({data:JSON.parse(replies)});
	            });
	            return;
	        }
	        page = parseInt(page);
	        const limit = 30;
	        const page_count = Math.ceil(r.length/limit);
	        if(page > page_count || page < 1){
	            return sendData({count:page_count,message:'Invalid page number',status:'error'});
	        }

	        const start = page_count * limit;
	        const end = limit;
	        const nextSeqCount = start + limit;//30 + 30 = 60
	        if(nextSeqCount > r.length){//60 > 50
	            end = r.length - start;// r.length - start = 50 - 30 = 20 to cut
	        }
	        
	        var redisCmds = r.slice(start, end).map(function(k){
	            return ['hget',config.coin + ':block_histories:'+id,k];
	        });

	        redisClient.multi(redisCmds,function(er,replies){
	            if(er){
	                return sendData({message: 'Query failed',status:"error"});
	            }

	            return sendData({count:page_count,page:page,data:replies,status:'success'});
	        });
	    });
	},
/**
 * Return blocks scoresheet for pool
 **/
	pool:function(urlParts, sendData){
		
	    var height = urlParts.query.height || "Current";
	    if(height !== "Current"){
	        height = parseInt(height)+"";
	    }
	    if(height.toLowerCase() == "current"){
	        height = "Current";
	    }
	    if(height === "Current"){
	    	return sendData({data:currentRound});
	    }
	    if(avaliableHeights.hasOwnProperty(height) >=0){
	    	return sendData({data:avaliableHeights[height],status:'success'});
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
			return sendData({data:o,status:'success',count:page_count,limit:limit,page:page,data:replies});
        });
	},
	setCurrentRound:function(data){
		currentRound=data;
	}
}