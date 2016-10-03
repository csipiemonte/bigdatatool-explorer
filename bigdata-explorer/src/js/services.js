var bigdataExplorerServices = bigdataExplorerServices || angular.module('bigdata-explorer.services', []);


bigdataExplorerServices.factory('hdfsService',["$http", "$base64", function($http, $base64) {


	var hdfsService = {};
	
	hdfsService.getInfo = function() {
		return "Direcotry List";
	};

	var callHdfs = function(operation, username, password, startPath){
		if(typeof startPath == 'undefined')
			startPath = "";
		var url = Constants.KNOX_BASE_URL+startPath+"?op="+operation;

		console.debug("hdfsService.getPath - url", url);
		console.debug("hdfsService.getPath - username", username);
		console.debug("hdfsService.getPath - password", password);
		
		var auth = $base64.encode(username + ":" + password); 
		console.debug("hdfsService.getPath - auth", auth);

	    
		var headers = { 
			   //'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
			//'Content-Type' : 'application/octet-stream',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
			'Accept-Encoding': 'gzip, deflate, sdch, br',
			'Authorization' : 'Basic ' + auth,
			'Access-Control-Allow-Origin': '*'
		};			

		
		

	    return $http.get(url, {headers: headers});
	};
	
	
	hdfsService.getPath = function(username, password, startPath) {
		return callHdfs(Constants.KNOX_OPERATIONS.LIST, username, password, startPath);
	};

	hdfsService.openFile = function(username, password, path) {
		return callHdfs(Constants.KNOX_OPERATIONS.OPEN, username, password, path);
	};
	
	hdfsService.getHomeDirectory = function(username, password){
		return callHdfs(Constants.KNOX_OPERATIONS.GETHOMEDIRECTORY, username, password, null);
	};

	return hdfsService;
}]);
