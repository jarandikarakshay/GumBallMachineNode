/**
 * New node file
 */

var MongoClient = require('mongodb').MongoClient;

var dbConnection = null;

connector = function(host, port, db,callback) {
	var url = 'mongodb://' + host + ":" + port + "/" + db;
	MongoClient.connect(url, function(err, db) {
		dbConnection = db;
		callback(err,db);
	});
}

showAllDbs = function(callback){
	dbConnection.admin().listDatabases(function(err, dbs) {
		dbConnection.close();
		callback(err,dbs.databases);
	  });
}



exports.connector = connector;
exports.showAllDbs = showAllDbs;
/*
 * MongoClient.connect('mongodb://localhost:27017/school', function(err, db) {
 * 
 * if(err) throw err;
 * 
 * var tmpState ='';
 * 
 * db.collection('students').find({},function(err, docs) {
 * 
 * if(err) throw err;
 * 
 * docs.each(function(err, doc) {
 * 
 * if(err) throw err;
 *  // console.log(doc["_id"]);
 * 
 * if(doc == null) { return db.close(); console.log("Connection closed"); }
 * 
 * if(doc.State != tmpState) { console.log("ID is "+doc["_id"]); tmpState =
 * doc.State; // console.log("In tmpState"+ doc.State);
 * db.collection('data').update({"_id": doc["_id"]},{$set : {'month_high' :
 * true} }, function(err,upd){ console.log("Update done"); }); } //
 * console.dir(docs);
 * 
 * }); }); });
 */
