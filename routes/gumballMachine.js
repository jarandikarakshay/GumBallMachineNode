
var mongoDb = require('./mongoModule');
var crypto = require('crypto');

var secretKey = "75D3645F516E1479C2FB44F27DF6D";
var machineSerialNum = "AJ10001";
var db = null, gumball = null;
//var dbDetails = {"host" : "CloudFoundry_b3lh89gr_n48d811u_j62mfhp4:eMh29YjPG4vyt_G-KpladCBkpmx53gIY@ds053310.mongolab.com",
//				 "port" : 53310,
//				 "databaseName" : "CloudFoundry_b3lh89gr_n48d811u"};


var dbDetails = {"host" : "akshayj:akshay12@ds043220.mongolab.com",
		 "port" : 43220,
		 "databaseName" : "ajdatabase"};

getGumball = function(callback) {

	mongoDb.connector(dbDetails.host, dbDetails.port, dbDetails.databaseName, function(err, db) {
		if (err)
			throw err;

		db.collection('gumball').find({
			"serial_number" : machineSerialNum
		}, function(err, docs) {
			if (err)
				throw err;

			docs.each(function(err, doc) {
				if (err)
					throw err;

				if (doc == null) {
					console.log("Connection closed");
					db.close();
				} else {
					callback(doc);
				}
			});
		});
	});
};

exports.show = function(req, res) {
	console.log("inside show");
	getGumball(function(gumball) {
		var data = null;
		console.log("inside1");
		if (gumball) {
			console.log("inside If");
			data = createSuccessMessage("NoCoinState", gumball.model_number,
					gumball.serial_number, "Gumball Machine Started");
		} else {
			console.log("inside Else");
			data = createFailureMessage("Gumball machine not available");
		}
		res.send(data);
	});
};

exports.insertQuarter = function(req, res) {
	// var str = state + "|" + model + "|" + serial + "|" + secretKey;
	var reqData = req.body;
	var str = reqData.state + "|" + reqData.model + "|" + reqData.serial + "|"
			+ secretKey;
	var shasum = crypto.createHash('sha256');
	shasum.update(str);
	var hash = shasum.digest("hex");

	var data = null;
	if (hash == reqData.hash) {
		data = createSuccessMessage("HasCoinState", reqData.model,
				reqData.serial, "Quarter inserted!!!");
	} else {
		data = createFailureMessage("Insert Quarter : Invalid operation ");
	}
	res.send(data);
};

exports.turnCrank = function(req,res){
	var reqData = req.body;
	var hash = createHash(reqData);
	getGumball(function(gumball){
		console.log("gumball - >" + gumball);
		if(gumball && hash == reqData.hash && reqData.state == "HasCoinState"){
			console.log("-> "+ gumball.count_gumball);
			if(gumball.count_gumball > 0){
				updateDatabase(gumball);
				data = createSuccessMessage("NoCoinState",
		        		  gumball.model_number, gumball.serial_number,
							"Enjoy the gumball :)");
			}else{
				data = createFailureMessage("Machine is out of gumball!! sorry for your loss :(");
			}
			
		}else{
			data = createFailureMessage("Invalid request!!!");
		}
		res.send(data);
	});
}



updateDatabase = function(gumball){
		if (gumball.count_gumball > 0) {
			mongoDb
					.connector(dbDetails.host, dbDetails.port, dbDetails.databaseName, function(err, db) {
				if (err) throw err;
				db.collection('gumball').findAndModify( {"serial_number" : machineSerialNum}, 
						[['_id','asc']],
						{$set: {"count_gumball" : gumball.count_gumball-1,"version" : gumball.version+1}},
				  {}, // options
				  function(err, gumballNewObject) {
				      if (err){
				          console.warn(err.message);  // returns error if no matching object found
				          data = createFailureMessage("Error");
				         
				      }else{
				          console.dir("----- >>"+ gumballNewObject);
				          
				      }
				  });
				});
	}
}


createHash = function(reqData){
	var str = reqData.state + "|" + reqData.model + "|" + reqData.serial + "|"
			+ secretKey;
	var shasum = crypto.createHash('sha256');
	shasum.update(str);
	var hash = shasum.digest("hex");
	return hash;
}


createSuccessMessage = function(state, model, serial, msg) {
	var str = state + "|" + model + "|" + serial + "|" + secretKey;
	var shasum = crypto.createHash('sha256');
	shasum.update(str);
	var hash = shasum.digest("hex");
	var data = {
		"state" : state,
		"model" : model,
		"serial" : serial,
		"hash" : hash,
		"status" : "success",
		"message" : msg
	};
	return data;
};

createFailureMessage = function(msg) {
	var data = {
		"status" : "error",
		"message" : msg
	};
	return data;
};

