var bigdataExplorerServices = bigdataExplorerServices || angular.module('bigdata-explorer.services', []);


bigdataExplorerServices.factory('hdfsService',["$http", "$base64", function($http, $base64) {


	var hdfsService = {};
	
	hdfsService.getInfo = function() {
		return "Direcotry List";
	};

	var callHdfs = function(operation, startPath){
		if(typeof startPath == 'undefined')
			startPath = "";
		var url = Constants.HDFS_BASE_URL+startPath+"?op="+operation;

		//var auth = $base64.encode(username + ":" + password); 
		//console.debug("hdfsService.getPath - auth", auth);

	    
		//var headers = { 
		//	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		//	'Authorization' : 'Basic ' + auth,
		//	'Access-Control-Allow-Origin': '*'
		//};			

		
		//return $http.get(url, {headers: headers});
		return $http.get(url);
	};
	
	
	hdfsService.getPath = function(startPath) {
		return callHdfs(Constants.HDFS_OPERATIONS.LIST, startPath);
	};

	hdfsService.previewFile = function(path) {
		var operation = Constants.HDFS_OPERATIONS.OPEN +"&length=1000000"; 
		return callHdfs(operation, path);
	};

	hdfsService.openFile = function(path) {
		var operation = Constants.HDFS_OPERATIONS.OPEN; 
		return callHdfs(operation, path);
	};

	hdfsService.getHomeDirectory = function(username, password){
		return callHdfs(Constants.HDFS_OPERATIONS.GETHOMEDIRECTORY, null);
	};
	
	hdfsService.logout = function(username, password){
		var url =window.location.href.replace("://", "://log:out@") ;
		console.log("url.", url);
 		return $http.get(url);
	};


	return hdfsService;
}]);


bigdataExplorerServices.factory('hiveService',["$http", "$base64", function($http, $base64) {


	var hiveService = {};
	
	hiveService.getInfo = function() {
		return "Database List";
	};

	var callHive = function(operation){
		var url = Constants.HIVE_BASE_URL+operation;
		console.debug("callHive - url", url);
		return $http.get(url);
	};
	

	hiveService.databaseList = function(){
		return callHive(Constants.HIVE_OPERATIONS.LIST_DATABASE);
	};

	hiveService.databaseSingle = function(database){
		return callHive(Constants.HIVE_OPERATIONS.SINGLE_DATABASE.replace("{database}", database));
	};
	
	hiveService.tableList = function(database){
		return callHive(Constants.HIVE_OPERATIONS.LIST_TABLES.replace("{database}", database));
	};
	
	hiveService.tableSingle = function(database, table){
		return callHive(Constants.HIVE_OPERATIONS.SINGLE_TABLE.replace("{database}", database).replace("{table}", table));
	};

	hiveService.tableSingleProperties = function(database, table){
		return callHive(Constants.HIVE_OPERATIONS.SINGLE_TABLE_PROPERTIES.replace("{database}", database).replace("{table}", table));
	};

	hiveService.jobSingle = function(job){
		return callHive(Constants.HIVE_OPERATIONS.SINGLE_JOB.replace("{job}", job));
	};
	
	
	
	hiveService.runQueryPreview = function(query, outputName){
		var postData = "execute="+query+"&statusdir="+outputName+"&define=mapreduce.job.queuename=produzione&define=hive.cli.print.header=true";
		return $http({
		    url: Constants.HIVE_BASE_URL+Constants.HIVE_OPERATIONS.HIVE_QUERY,//+"?&"+postData,
		    dataType: 'text',
		    method: 'POST',
		    data: postData,
		    headers: {
		        "Content-Type": "text/plain"
		    }
		});
	};
	
	hiveService.systemWebhcatStatus = function(){return callHive(Constants.HIVE_OPERATIONS.SYSTEM_WEBHCAT_STATUS);};
	hiveService.systemWebhcatVersion = function(){return callHive(Constants.HIVE_OPERATIONS.SYSTEM_WEBHCAT_VERSION);};
	hiveService.systemHiveVersion = function(){return callHive(Constants.HIVE_OPERATIONS.SYSTEM_HIVE_VERSION);};
	hiveService.systemHadoopVersion = function(){return callHive(Constants.HIVE_OPERATIONS.SYSTEM_HADOOP_VERSION);};
	


	hiveService.logout = function(username, password){
		var url =window.location.href.replace("://", "://log:out@") ;
		console.log("url.", url);
 		return $http.get(url);
	};


	return hiveService;
}]);
