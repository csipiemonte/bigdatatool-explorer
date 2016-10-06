var bigdataExplorerServices = bigdataExplorerServices || angular.module('bigdata-explorer.services', []);


bigdataExplorerServices.factory('hdfsService',["$http", "$base64", function($http, $base64) {


	var hdfsService = {};
	
	hdfsService.getInfo = function() {
		return "Direcotry List";
	};

	var callHdfs = function(operation, startPath){
		if(typeof startPath == 'undefined')
			startPath = "";
		var url = Constants.KNOX_BASE_URL+startPath+"?op="+operation;

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
		return callHdfs(Constants.KNOX_OPERATIONS.LIST, startPath);
	};

	hdfsService.openFile = function(path) {
		return callHdfs(Constants.KNOX_OPERATIONS.OPEN, path);
	};
	
	hdfsService.getHomeDirectory = function(username, password){
		return callHdfs(Constants.KNOX_OPERATIONS.GETHOMEDIRECTORY, null);
	};

	return hdfsService;
}]);
