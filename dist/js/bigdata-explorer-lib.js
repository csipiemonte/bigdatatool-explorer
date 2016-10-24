var Constants = Constants || {};


//Constants.KNOX_BASE_URL = "https://sdnet-knox.sdp.csi.it:8443/gateway/default/webhdfs/v1";
//Constants.HDFS_BASE_URL = "https://sdnet-webedge.sdp.csi.it/bigdata-explorer/knox/gateway/default/webhdfs/v1";
//Constants.HIVE_BASE_URL = "https://sdnet-webedge.sdp.csi.it/bigdata-explorer/knox/gateway/default/webhdfs/v1";

Constants.KNOX_BASE_URL = "knox/gateway/default";
Constants.HDFS_BASE_URL = Constants.KNOX_BASE_URL  + "/webhdfs/v1";
Constants.HIVE_BASE_URL = Constants.KNOX_BASE_URL  + "/templeton/v1/";


// list database
//https://sdnet-knox.sdp.csi.it:8443/gateway/default/templeton/v1/ddl/database/?user.name=sdp

// single database
//https://sdnet-knox.sdp.csi.it:8443/gateway/default/templeton/v1/ddl/database/yucca_metadata?user=sdp

// list tables
//https://sdnet-knox.sdp.csi.it:8443/gateway/default/templeton/v1/ddl/database/yucca_metadata/table
	
// single table
//https://sdnet-knox.sdp.csi.it:8443/gateway/default/templeton/v1/ddl/database/yucca_metadata/table/dim_dataset
	
Constants.HDFS_OPERATIONS = {"LIST":"LISTSTATUS", "OPEN": "OPEN", "GETHOMEDIRECTORY": "GETHOMEDIRECTORY"};

Constants.HIVE_OPERATIONS = {"LIST_DATABASE": "ddl/database/?", 
							 "SINGLE_DATABASE": "ddl/database/{database}?",
							 "LIST_TABLES": "ddl/database/{database}/table?", 
							 "SINGLE_TABLE": "ddl/database/{database}/table/{table}",
							 "SINGLE_TABLE_PROPERTIES": "ddl/database/{database}/table/{table}/property",
							 "SINGLE_JOB": "jobs/{job}",
							 "SYSTEM_WEBHCAT_STATUS":"status",
							 "SYSTEM_WEBHCAT_VERSION":"version",
							 "SYSTEM_HIVE_VERSION":"version/hive",
							 "SYSTEM_HADOOP_VERSION":"version/hadoop",
							 "HIVE_QUERY": "hive"
							 };

Constants.HIVE_HIERARCHY = ["root", "databases","tables", "columns"];

Constants.HIVE_NODE_TYPES = {'root':{name:'root', icon: "glyphicon glyphicon-hdd icon-root"},
		'database':{name:'database', icon: "icon icon-database"},
		'table':{name:'table', icon: "icon icon-table"},
		'column':{name:'column', icon: "glyphicon glyphicon-option-vertical"},
		 };



Constants.Time = {};
Constants.Time.ONE_MINUTE = 60000;
Constants.Time.ONE_HOUR = 3600000;
Constants.Time.ONE_DAY = 86400000;
Constants.Time.ONE_MONTH = 2678400000;
Constants.Time.ONE_YEAR = 31536000000;




var bigdataExplorerFilter  = angular.module('bigdata-explorer.filters', []);

bigdataExplorerFilter.filter('safeNumber', function() {
	return function(input, decimal) {
		var result = input;
		if(!isNaN(input) ){
			if(isNaN(decimal))
				decimal=0;
			result = input.toFixed(decimal);
		}
		return result;
	};
});

bigdataExplorerFilter.filter('format_big_number', function() {
	return function(input) {
		console.log("input", input);
		var output = "";
		if (input) {
			input=Number.parseFloat(input);
			if(input<1000)
				output=input.toFixed(2);
			else if(input<1000000)
				output=(input/1000).toFixed(2)+" <span class='counter-group'>k</span>";
			else if(input<1000000000)
				output=(input/1000000).toFixed(2)+" <span class='counter-group'>M</span>";
			else if(input<1000000000000)
				output=(input/1000000000).toFixed(2)+" <span class='counter-group'>B</span>";
	    }
		return (""+output).replace(".", ","); 
	};
});

bigdataExplorerFilter.filter('format_filesize', function() {
	return function(input) {
		var output = "";
		if (input) {
			input = parseInt(input);
			if(input<1000)
				output=input+" byte";
			else if(input<1000000)
				output=(input/1000).toFixed(1)+" Kb";
			else if(input<1000000000)
				output=(input/1000000).toFixed(1)+" Mb";
			else if(input<1000000000000)
				output=(input/1000000000).toFixed(1)+" Gb";
	    }
		return output;
	};
});

bigdataExplorerFilter.filter('string_ellipse', function () {
    return function (text, length, end) {
    	
    	if(typeof text === "undefined"  || text == null)
    		text = "";
    	
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }
    };
});

angular.module('bigdata-explorer.plugin', [
  'bigdata-explorer',
  'bigdata-explorer.templates',
  'bigdata-explorer.utils',
  'bigdata-explorer.filters',
  'bigdata-explorer.services',
  'base64'
]);

var bigdataExplorerTemplatesModule = angular.module('bigdata-explorer.templates', ['bigdata-explorer.utils']);
var bigdataExplorerModule = angular.module('bigdata-explorer', ['bigdata-explorer.templates', 'bigdata-explorer.services']);

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

var yuccaUtilsModule = angular.module('bigdata-explorer.utils', []);

yuccaUtilsModule.factory('$bigdataExplorerHelpers', [function () {
	return{
		"attrs":{
			num : function(value, min, max, defaultValue){
				var result = value;
				if(isNaN(value) || value == null || value == "" ||
						(typeof min != 'undefined' && min !=null && value<min) || 
						(typeof max != 'undefined' && max !=null && value>max))
						result = defaultValue;
				return result;
			},
			safe: function(value, defaultValue){
				var result = value;
				if(typeof value == 'undefined' || value == null || value == '')
					result = defaultValue;
				return result;
			}
		},
		"utils":{
			isEmpty: function(input){
				return (typeof input == 'undefined' || input==null );
			},
			hex2Rgb: function(hex){
				if(hex.charAt(0)=="#") 
					hex = hex.substring(1,7);
				var r = parseInt((hex).substring(0,2),16);
				var g = parseInt((hex).substring(2,4),16);
				var b = parseInt((hex).substring(4,6),16);
				return r+","+g +","+b;
			},
			formatDateFromMillis: function(millis){
				var formattedDate = "";
				if(millis){
					var date   = new Date(millis);
					var d = date.getDate();
				    var m = date.getMonth() + 1;
				    var y = date.getFullYear();
				    var hh = date.getHours();
				    var mm = date.getMinutes();
					formattedDate = '' + (d <= 9 ? '0' + d : d) + '/' + (m<=9 ? '0' + m : m) + '/' + y + ' ' + (hh <= 9 ? '0' +hh : hh) + ":" +  (mm <= 9 ? '0' + mm : mm);
				}
				return formattedDate;
			},
			lZero: function(value){
				var result = "00";
				if(!isNaN(value)){
					result= (value <= 9 ? '0' + value : value);
				}
				return result;
				
			},
		    formatData: function(millis){
				var formattedDate = "";
				if(millis){
					var date   = new Date(millis);
					var d = date.getDate();
				    var m = date.getMonth() + 1;
				    var y = date.getFullYear();
				    var hh = date.getHours();
				    var mm = date.getMinutes();
				    var ss = date.getSeconds();
				    
					formattedDate = '' + y + '/' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + ' ' + (hh <= 9 ? '0' +hh : hh) + ":" +  (mm <= 9 ? '0' + mm : mm) + ":" + (ss <= 9 ? '0' + ss : ss);
				}

				return formattedDate;		    			
			},

		},
		"render": {
			safeTags : function (stringIn) {
				var outString = "";
				if((typeof stringIn != "undefined") && stringIn!=null){
					var typeStringIN = typeof stringIn;
					if (typeStringIN == "string")
						outString = stringIn.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
					else 
						outString = stringIn;
				}
			    return outString;   

			},
			linkify: function(stringIn) {
				var outString = "";
				if((typeof stringIn != "undefined") && stringIn!=null){
					var typeStringIN = typeof stringIn;
					if (typeStringIN == "string"){
					    var  replacePattern1, replacePattern2, replacePattern3;
				
					    //URLs starting with http://, https://, or ftp://
					    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
					    outString = stringIn.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
				
					    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
					    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
					    outString = outString.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
				
					    //Change email addresses to mailto:: links.
					    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
					    outString = outString.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
					} else 
						outString = stringIn;
				}

				return outString;
			}
		}		
	};

}]);


bigdataExplorerModule.directive('hdfsExplorer', ['hdfsService', '$bigdataExplorerHelpers', 
    function (hdfsService,$bigdataexplorerHelpers) {
    'use strict';

    return {
        restrict: 'E',
        scope: {},
        templateUrl:'template/hdfs-explorer.html',
        link: function(scope, elem, attr) {
            console.debug("attrs", attr);
            console.debug("hdfsService",hdfsService.getInfo());
            
            scope.started = false;
            var startpath = attr.startpath;
            scope.pathToBrowse = [];
            scope.copyPanel = {pathToCopy: null};
                        
            var rootFolder = {"fullpath": startpath, "pathSuffix": ""};
            console.log("rootFolder",rootFolder);
            
            scope.filetree = {
            		"viewId" : "root_",
            		"pathSuffix": startpath,
            		"children": [],
            		"fullpath": attr.startpath + "/",
            		"loadChildren": function(){scope.selectNode(this.fullpath);}, 
            		"icon": "glyphicon glyphicon-folder-open",
                	"isOpen": true,
            	};
            	
            var refreshFileList = function(selectedNode){
            	scope.filemessage = null;
            	scope.filelist= [];
            	if(selectedNode.children.length == 0){
            		scope.filemessage = {"type":"info", "text":"Folder empty"};
            	}
            	else{
	            	for(var i=0; i<selectedNode.children.length; i++){
	            		//selectedNode.children[i].icon = selectedNode.children[i].type == "DIRECTORY"?"glyphicon glyphicon-folder-close folder-icon":"glyphicon glyphicon-file file.icon";
	            		
	            		if(selectedNode.children[i].type == "DIRECTORY"){
	            			selectedNode.children[i].icon = "glyphicon glyphicon-folder-close folder-icon";
	            			selectedNode.children[i].loadChildren = function(){scope.selectNode(this);};
	            		}
	            		else{
	            			selectedNode.children[i].icon = "glyphicon glyphicon-file file-icon";
	            			if(selectedNode.children[i].pathSuffix.lastIndexOf('.')>=0){
	            				selectedNode.children[i].fileExt = selectedNode.children[i].pathSuffix.split('.').pop();
	            				selectedNode.children[i].icon += " icon-" + selectedNode.children[i].fileExt;
	            			}
	            		}
	            		scope.filelist.push(selectedNode.children[i]);
	            	}
            	}
            };
            
            var scrollTo = function(parentId, elementId) {
            	setTimeout(function() {
            		var element = angular.element(document.querySelector( '#' + elementId));
                    console.log("element", elementId);
                    angular.element(document.querySelector( '#' + parentId ))[0].scrollTop = element.prop('offsetTop');
                    console.log("parent", angular.element(document.querySelector( '#' + parentId )));
            	}, 0);
                
            };
            
          
            var refreshFolderList = function(fromNode){
            	fromNode.isOpen = !fromNode.isOpen;
    	    	if(scope.pathToBrowse.length>0){
    	    		fromNode.isOpen = true;
    	    		var currentPath  = scope.pathToBrowse[0];
    	    		scope.pathToBrowse.shift();
    	    		scope.selectNode(findChildren(fromNode, currentPath));
    	    	}
    	    	else{
    	    		scrollTo("folder-tree-panel", fromNode.viewId);
                	scope.selectedFolderPath = fromNode.fullpath;
                	console.info("scope.pathToBrowse ", scope.pathToBrowse);
                	console.info("selectedFolderPath - ", scope.selectedFolderPath);
    	    	}
            };
            
            scope.selectNode = function(fromNode){
            	console.debug("fromNode", fromNode);
            	console.debug("fromPath", fromNode.fullpath);
            	console.log("qui");
            	if(fromNode.children.length==0){
	            	hdfsService.getPath(fromNode.fullpath).then(function (response) {
	        	    	console.log("response", response.data.FileStatuses.FileStatus);
	        	    	scope.list =  response.data.FileStatuses.FileStatus;
	        	    	for (var i = 0; i < response.data.FileStatuses.FileStatus.length; i++) {
	        	    		
	        	    		var item = response.data.FileStatuses.FileStatus[i];
	        	    		item.fullpath = fromNode.fullpath + item.pathSuffix;
	        	    		item.viewId = fromNode.viewId + item.pathSuffix.replace(".","_") + "_";

	        	    		if(item.type == 'DIRECTORY')
	        	    			item.fullpath += "/" ;
	        	    		item.loadChildren = function(){scope.selectNode(this);};
	        	    		item.children = [];
	        	    		fromNode.children.push(item);
	        	    	}
	        	    	refreshFileList(fromNode);
	        	    	refreshFolderList(fromNode);
	        	
	        	    }, function(response){
	        	    	console.error("getPath response error", response);
	        	    	scope.filelist= [];
	        	    	scope.filemessage = {"type":"danger", "text":"<strong>" + response.status + "</strong> " + response.statusText};
	        	    	refreshFolderList(fromNode);
	        	    });
            	}
            	else{
            		refreshFileList(fromNode);
        	    	refreshFolderList(fromNode);

            	}
    	    	
            	
            };
            
            var findChildren  = function(parentNode, path){
            	console.log("parentNode",parentNode, path);
            	console.log("path", path);
            	var childrenNode = null;
            	if(parentNode && parentNode!=null){
	            	for (var i = 0; i < parentNode.children.length; i++) {
						if(parentNode.children[i].pathSuffix == path){
							childrenNode = parentNode.children[i];
							break;
						}
					}
            	}
            	return childrenNode;
            };
            
          scope.browseToHome = function(){
        	hdfsService.getHomeDirectory().then(function (response) {
    	    	console.log("response", response);
    	    	if(response!=null && response.data !=null && response.data.Path !=null){
    	    		scope.pathToBrowse = response.data.Path.split("/");
    	    		scope.pathToBrowse.shift();
    	    		scope.selectNode(scope.filetree);
    	    	}
    	    }, function(response){
    	    	console.error("browseToHome response error", response);
    	    });
          };
          
          scope.browseToPath = function(path){
        	  scope.pathToBrowse = path.split("/");
	    	  scope.pathToBrowse.shift();
	    	  if(scope.pathToBrowse[scope.pathToBrowse.length - 1] == "")
	    		  scope.pathToBrowse.pop();

	    	  scope.showFavoritePanel = false;
	    	  scope.selectNode(scope.filetree);
	    	  
          };
          
          scope.levelUp = function(path){
        	  if(path && path!=null){
        		  path = path.substring(0, path.lastIndexOf("/")); // remove last index
        		  path = path.substring(0, path.lastIndexOf("/")); // remove last folder
        		  scope.browseToPath(path);
        	  }
          };

            
  
            scope.start = function(){
            	scope.selectNode(scope.filetree);
            	scope.started=true;
            };
            
            scope.start();
            
            
            scope.openFile = function(file){
            	console.log("openFile", file);
//            	var downloadLink = angular.element('<a></a>');
//                downloadLink.attr('href',Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN");
//                downloadLink.attr('download', file.pathSuffix);
//    			downloadLink[0].click();
//            	console.log("openFile", Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN");
    	    	if(file.fileExt && (file.fileExt == "jpg" || file.fileExt == "tiff" || file.fileExt == "gif" || file.fileExt == "bmp" || file.fileExt == "png" || file.fileExt == "jpeg" || 
    	    		file.fileExt == "ogg" || file.fileExt == "mp4" || file.fileExt == "webm" || file.fileExt == "mp3" || file.fileExt == "aac")){

    	    		var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href',Constants.HDFS_BASE_URL+ file.fullpath + "?op=OPEN");
                    downloadLink.attr('download', file.pathSuffix);
        			downloadLink[0].click();
    	    	}
    	    	else{
	            	hdfsService.openFile(file.fullpath).then(function (response) {
	        	    	console.log("response", response);
	        	    	var blob = new Blob([response.data]);			
	        			var downloadLink = angular.element('<a></a>');
	                    downloadLink.attr('href',window.URL.createObjectURL(blob));
	                    downloadLink.attr('download', file.pathSuffix);
	        			downloadLink[0].click();
	        			
	        	    }, function(response){
	        	    	console.error("response error", response);
	                	scope.message = {type:"danger",title:"Unable to download the file",text:"<strong>" + response.status + "</strong> " + response.statusText};
	        	    });
    	    	}
            };
            
            scope.imgFit = function(orientation){
            	if(orientation=='width'){
            		scope.imageFitWidth = '100%';
            		scope.imageFitHeight = 'auto';
            	}
            	else{
            		scope.imageFitWidth = 'auto';
            		scope.imageFitHeight = '300px';
            	}
            };

            scope.previewFile = function(file){
            	scope.imgPreviewUrl = null;
    	    	if(file.fileExt && (file.fileExt == "jpg" || file.fileExt == "tiff" || file.fileExt == "gif" || file.fileExt == "bmp" || file.fileExt == "png" || file.fileExt == "jpeg")){
    	    		scope.imgPreviewUrl =  Constants.HDFS_BASE_URL+ file.fullpath + "?op=OPEN" ;
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":""};
    	    	}
    	    	else if(file.fileExt && (file.fileExt == "ogg" || file.fileExt == "mp4" || file.fileExt == "webm")){
    	    		var body = "<p class='file-preview-body'><video width='320' height='240' controls><source src='"+ Constants.HDFS_BASE_URL+ file.fullpath + "?op=OPEN'></source></video></p><p><strong>File name:</strong> "+file.pathSuffix+"</p>";
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":body};
    	    	}
    	    	else if(file.fileExt && (file.fileExt == "mp3" || file.fileExt == "aac")){
    	    		var body = "<p class='file-preview-body'><audio width='320' height='240' controls><source src='"+ Constants.HDFS_BASE_URL+ file.fullpath + "?op=OPEN'></source></audio></p><p><strong>File name:</strong> "+file.pathSuffix+"</p>";
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":body};
    	    	}
    	    	else{ 
	            	hdfsService.previewFile(file.fullpath).then(function (response) {
	        	    	console.log("response", response);
	        	    	var body = "";
	        	    	if(file.fileExt && file.fileExt == "csv"){
	        	    		body = "<div class='preview-container'><table class='table table-condensed table-bordered table-preview'><tbody>";
	        	    		var csvLines = response.data.match(/[^\r\n]+/g);
	        	    		for(var i=0; i<csvLines.length;i++){
	        	    			body += "<tr>";
	        	    			var cols = csvLines[i].split(",");
	        	    			for(var j=0; j<cols.length; j++)
	        	    				body += "<td>" + cols[j] + "</td>";
	        	    			body += "</tr>";
	        	    		}
	        	    		body += "</tbody></table></div>";
	        	    	}
	        	    	else
	        	    		body = "<p class='file-preview-body'>"+response.data+"</p>";
	                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":body};
	        	    }, function(response){
	        	    	console.error("response error", response);
	                	scope.message = {type:"danger",title:"Unable to create the file preview",text:"<strong>" + response.status + "</strong> " + response.statusText};
	        	    });
    	    	}
            };
            
            scope.logout = function(){
            	
            	hdfsService.logout().then(function (response) {
            		scope.started = false;
            		var startpath = null;
            	 }, function(response){
	        	    	console.error("response error", response);
	                	scope.message = {type:"danger",title:"Logout failed",text:"Unable to logout <strong>" + response.status + "</strong> " + response.statusText +"</br><p>Close the browser</p>"};
	        	 });

            };

            
            scope.refresh = function(){
            	 scope.filetree.children = [];
            	 scope.start();
            };
            
            scope.supportsStorage = function() {
            	  try {
            	    return 'localStorage' in window && window['localStorage'] !== null;
            	  } catch (e) {
            	    return false;
            	  }
            };
            
            scope.favoritesPath = [];
            if(scope.supportsStorage()){
            	scope.favoritesPath = JSON.parse(localStorage.getItem("favoritesPath"));
            	if(typeof scope.favoritesPath == 'undefined' || scope.favoritesPath == null)
            		scope.favoritesPath = [];
            }
            
            console.log("scope.favoritesPath",scope.favoritesPath);
            
            scope.addCurrentPathToFavorite = function(){
            	scope.selectedFolderPath;
            	if(scope.favoritesPath.indexOf(scope.selectedFolderPath)<0){
            		scope.favoritesPath.push(scope.selectedFolderPath);
            		scope.favoritesPath.sort();
            		localStorage.setItem("favoritesPath", JSON.stringify(scope.favoritesPath));
            	}
            };
            
            scope.removeFavorite  = function(favoriteToRemove){
            	var index = scope.favoritesPath.indexOf(favoriteToRemove);
            	if (index > -1) {
            		scope.favoritesPath.splice(index, 1);
            		localStorage.setItem("favoritesPath", JSON.stringify(scope.favoritesPath));
            	}
            };
            
            
            scope.copyToClipboard = function(path){
           	 scope.copyPanel.pathToCopy = path;
           	 setTimeout(function() {
           		angular.element(document.querySelector( '#copyToClipboardTextArea'))[0].select();
         	}, 0);
           };
           

            scope.selectedFolderPath = "";
            scope.filelist= [];
        }

    };
}]);

bigdataExplorerTemplatesModule.run(["$templateCache", function($templateCache) {
  $templateCache.put("template/hdfs-explorer.html",
    '<div class="explorer-header-toolbar clearfix" ng-show="started">\n'+ 
    '  <div>\n'+
    '     <div class="pull-left toolbar-panel"> \n'+
    '       <a class="" href ng-click="refresh();"><i class="glyphicon glyphicon-refresh"></i> Refresh</a>\n'+
   // '       <a class="" href ng-click="browseToHome();"><i class="glyphicon glyphicon-home"></i> Home</a> \n'+
    '       <a class="" ng-show="supportsStorage()" href ng-click="showFavoritePanel=true"><i class="glyphicon glyphicon-star"></i> Favorites</a> \n'+
    '     </div>\n'+
    '     <div class="pull-right">\n'+
    //'       <div>User <strong>{{username}}</strong></div>\n'+
    '       <div><a class="" href ng-click="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></div>\n'+ 
    '     </div>\n' +
    '  </div>\n' +
    '</div>' +
    
    
	'<div class="explorer-start-panel row" ng-show="!started">\n' + 
    '  <div class="col-sm-8  explorer-start-intro">\n' + 
    '    Insert user and password, or bind them using \n' + 
    '    <a href="http://zeppelin.apache.org/docs/0.6.1/displaysystem/front-end-angular.html" target="_blank"><code>z.angularBind</code></a> if you are using \n' + 
    '    <a hre="https://zeppelin.apache.org/" target="_blank"><strong>Apache Zeppelin</strong></a>\n' + 
    '  </div>\n'+ 
    '</div>\n'+
    '<div class="row explorer-wrapper" ng-show="started">\n' + 
    '  <div class="col-sm-8 col-sm-offset-4">\n'+
    '    <p><a href ng-click="levelUp(selectedFolderPath)"><i class="glyphicon glyphicon-level-up level-up-icon" ng-show="selectedFolderPath!=\'/\'"></i></a> <strong translate>Full path</strong> <code>{{selectedFolderPath}}</code></p>\n' + 
    '  </div>\n'+
    '  <div class="col-sm-4 folder-tree-panel" id="folder-tree-panel">\n'+
    '     <a href ng-click="start()"  ng-class="filetree.fullpath == selectedFolderPath?\'folder-selected\':\'\'">\n'+
	'  		<i ng-class="filetree.icon" class="item-icon folder-icon"></i> {{filetree.pathSuffix}}<span ng-show="filetree.pathSuffix==\'\'">(root)</span>\n'+
	'    </a> \n' +
    '    <ul class="folder-tree-list"> \n' +
    '      <li ng-repeat="folder in filetree.children | filter : {type: \'DIRECTORY\'} : true track by $index" ng-include="\'template/treefolder-view.html\'" ></li> \n' +
    '    </ul> \n'+
    '  </div>\n'+
    '  <div class="col-sm-8 file-view-panel">\n'+
    '	 <div class="alert alert-{{filemessage.type}}" role="alert" ng-show="filemessage!=null"><span ng-bind-html="filemessage.text"></span></div>\n'+
    '    <table class="table table-striped table-condensed" ng-show="filelist.length>0">\n'+
    '      <thead>\n'+
    '        <tr><th>&nbsp;</th><th>Name</th><th>Update Date</th><th>Size</th><th>Owner</th><th>Group</th><th>Permission</th><th>Action</th></tr>\n'+
    '      </thead>\n'+
    '      <tbody>\n'+
    '        <tr ng-repeat="file in filelist track by $index">\n'+
    ' 			<td><i class="{{file.icon}}"></i></td>\n'+
    '           <td ng-show="file.type==\'DIRECTORY\'"><a href ng-click="file.loadChildren()">{{file.pathSuffix}}</a></td>\n'+
    '           <td ng-show="file.type!=\'DIRECTORY\'">{{file.pathSuffix}}</td>\n'+
    '           <td>{{file.modificationTime|date}}</td>\n'+
    '           <td>{{file.length|format_filesize}}</td>\n'+
    '           <td>{{file.owner}}</td>\n'+
    '           <td>{{file.group}}</td>\n'+
    '           <td>{{file.permission}}</td>\n'+
    '           <td>\n'+
    '               <a href ng-click="copyToClipboard(file.fullpath)" title="Copy full path: {{file.fullpath}}" class="file-action-button"><i class="glyphicon glyphicon-copy"></i></a>\n'+
    '               <a ng-show="file.type!=\'DIRECTORY\'" href ng-click="openFile(file)" title="Open file" class="file-action-button"><i class="glyphicon glyphicon-save"></i></a>\n'+
    '               <a ng-show="file.type!=\'DIRECTORY\'" href ng-click="previewFile(file)" title="Open file" class="file-action-button"><i class="glyphicon glyphicon-eye-open"></i></a>\n'+
    '           </td>\n'+
    '        </tr>\n'+
    '      </tbody>\n'+
    '    </table>\n'+
    '  </div>\n'+
    '</div>\n'+
    '<div class="panel panel-{{message.type}} alert-main" ng-show="message!=null">\n'+
    '  <div class="panel-heading">{{message.title}} <span class="close" ng-click="message = null">&times;</span></div>\n'+
    '  <div class="panel-body"><p><span ng-bind-html="message.text"></span></p><div class="text-center"><a href ng-click="message = null" class="btn btn-default">Close</a></div></div>\n'+
    '</div>\n'+
    '<div class="panel panel-default modal-panel" ng-show="modalPanelContent!=null">\n'+
    '  <div class="panel-heading">{{modalPanelContent.title}} <span class="close" ng-click="modalPanelContent = null">&times;</span></div>\n'+
    '  <div class="panel-body">\n'+
    '    <p ng-show="imgPreviewUrl!=null"><strong>Fit image </strong> \n' +
    '       <a class="btn btn-default" href ng-click="imgFit(\'width\')"><i class="glyphicon glyphicon-resize-horizontal" alt="width"></i></a> \n' +
    '       <a  class="btn btn-default" href ng-click="imgFit(\'height\')" alt="height"><i class="glyphicon glyphicon-resize-vertical"></i></a> \n' + 
    '    </p>' + 
    '    <p class="file-preview-body" ng-show="imgPreviewUrl!=null"><img src="{{imgPreviewUrl}}"  width="{{imageFitWidth}}" height="{{imageFitHeight}}"></img></p>\n' +
    '    <div ng-bind-html="modalPanelContent.body"></div><div class="text-center"><a href ng-click="modalPanelContent = null" class="btn btn-default">Close</a></div>\n'+
    '  </div>\n'+
    '</div>\n'+
    '</div>\n'+
    '<div class="panel panel-default modal-panel" ng-show="copyPanel.pathToCopy!=null">\n'+
    '  <div class="panel-heading">Copy full path<span class="close" ng-click="copyPanel.pathToCopy = null">&times;</span></div>\n'+
    '  <div class="panel-body clipboard-copy-panel">\n'+
    '    <p><textarea id="copyToClipboardTextArea" readonly >{{copyPanel.pathToCopy}}</textarea> </p>\n'+
    '    <p><strong>Ctrl+C</strong> <small>to copy</small></p>\n'+
    '    <div class="text-center"><a href ng-click="copyPanel.pathToCopy = null" class="btn btn-default">Close</a></div>\n'+
    ' </div>\n'+
    '</div>\n'+
    '<div class="panel panel-default modal-panel" ng-show="showFavoritePanel">\n'+
    '  <div class="panel-heading"><i class="glyphicon glyphicon-star"></i> Favorites<span class="close" ng-click="showFavoritePanel=false">&times;</span></div>\n'+
    '  <div class="panel-body ">\n'+
    '    <p><ul class="list-group"><li class="list-group-item" ng-repeat="favorite in favoritesPath track by $index">\n'+
    '        <a href ng-click="browseToPath(favorite)">{{favorite}}</a><a href ng-click="removeFavorite(favorite)" class="pull-right"><i class="glyphicon glyphicon-trash"></i></a>\n'+
    '    </li></ul></p>\n'+
    '    <p><a href ng-click="addCurrentPathToFavorite()" class="btn"><i class="glyphicon glyphicon-plus"></i> Add current path to favorite</a></p>\n'+
    '  <div class="text-center"><a href ng-click="showFavoritePanel = false" class="btn btn-default">Close</a></div></div>\n'+
    '</div>\n'  );	    		

  
  $templateCache.put("template/treefolder-view.html",
	'<a   id="{{folder.viewId}}" href ng-click="folder.loadChildren()" ng-class="folder.fullpath == selectedFolderPath?\'folder-selected\':\'\'">\n'+
	'  <i ng-class="folder.isOpen?\'glyphicon glyphicon-folder-open\':\'glyphicon glyphicon-folder-close\'" class="item-icon folder-icon"></i> {{folder.pathSuffix}}\n'+
	'</a> \n' +
	'<ul class="folder-tree-list" ng-show="folder.isOpen"> \n' +
	'   <li ng-repeat="folder in folder.children | filter : {type: \'DIRECTORY\'} : true track by $index" ng-include="\'template/treefolder-view.html\'">\n'+
	'   </li>\n'+  
	'</ul> \n'
  );
}]);


bigdataExplorerModule.directive('hiveExplorer', ['hiveService', 'hdfsService', '$bigdataExplorerHelpers',
    function (hiveService, hdfsService, $bigdataexplorerHelpers) {
    'use strict';

    return {
        restrict: 'E',
        scope: {},
        templateUrl:'template/hive-explorer.html',
        link: function(scope, elem, attr) {
            console.debug("attrs", attr);
            console.debug("hiveService",hiveService.getInfo());
            
            scope.started = false;

          
            var createNode = function(nodeType, parent, nodeName){
            	var database = null;
            	if(nodeType == Constants.HIVE_NODE_TYPES.database.name)
            		database = nodeName;
            	else if(nodeType == Constants.HIVE_NODE_TYPES.table.name)
            		database = parent.database;
            	
            	return {"viewId" : parent.viewId + nodeName +"_",
            		"name": nodeName,
            		"label": nodeName,            		
            		"nodeType": nodeType,
            		"children": [],
            		"loadChildren": function(){scope.selectNode(this);}, 
            		"icon": Constants.HIVE_NODE_TYPES[nodeType].icon,
            		"isOpen" : false,
            		"database": database,
            		"isLoading": false
            	};
            	
            };

            scope.tree = createNode("root", "", "root");

            var formatErrorMessage = function(error){
    	    	console.error("formatErrorMessage", error);
    	    	var detail = "";
    	    	if(error.data && error.data!=null && error.data.error && error.data.error!=null)
    	    		detail = error.data.error;
    			return {"type":"danger", "text":"<strong>" + error.status + " - " + error.statusText + "</strong> <p><span title='"+detail+"'>"+detail.substring(0,128) + "&hellip;</span></p>"};
    		};
    		
    		var selectRoot = function(node){
    			console.debug("selectRoot", node);
    			scope.selectedNode = node;
    			if(node.children.length==0){
    				node.isLoading=true;
    				hiveService.databaseList().then(function (response) {
	            		console.log("databaseList",response );
	            		addChilds(Constants.HIVE_NODE_TYPES.database.name, node, response.data.databases);
	            		node.isLoading=false;
	            	}, function(error){
	            		node.isLoading=false;
	            		node.message = formatErrorMessage(error);
	            	});
    			};
    			if(!node.detail && node.detail==null)
    				loadSystemInfo(node);
    		};
    		
    		 var loadSystemInfo = function(node){
             	node.detail = {hadoop_version : "Loading...", 
             			hive_version : "Loading...", 
             			webhcat_version : "Loading...", 
             			webhcat_status : "Loading..."};
             	
             	
             	hiveService.systemWebhcatStatus().then(function (response) {
             		node.detail.webhcat_status = response.data.status;
             		node.detail.webhcat_version = response.data.version;
             	}, function(error){
         	    	node.message = formatErrorMessage(error);
         	    });
             	
             	hiveService.systemHiveVersion().then(function (response) {
             		node.detail.hive_version = response.data.version;
             	},  function(error){
         	    	node.message = formatErrorMessage(error);
         	    });
             	
             	hiveService.systemHadoopVersion().then(function (response) {
             		node.detail.hadoop_version = response.data.version;
             	},  function(error){
         	    	node.message = formatErrorMessage(error);
         	    });
             	
             };
    		
    		var selectDatabase = function(node){
    			console.debug("selectDatabase", node);
    			scope.selectedNode = node;
    			if(node.children.length==0){
    				node.isLoading=true;

    				hiveService.tableList(node.name).then(function (response) {
    					console.log("tableList",response );
    					addChilds(Constants.HIVE_NODE_TYPES.table.name, node, response.data.tables);
    					node.isLoading=false;	
	            	}, function(error){
	            		node.isLoading=false;
	            		node.message = formatErrorMessage(error);
	            	});
    			}
    			if(!node.detail && node.detail==null)
    				loadDatabaseDetail(node);
    		};
    		
    		
    		
    		var loadDatabaseDetail = function(node){ 
    			node.detail = {isLoadingInfo: true};

             	hiveService.databaseSingle(node.name).then(function (response) {
             		console.log("databaseSingle", response);
             		node.detail.location = "<code>" + response.data.location+"</code>";
             		node.detail.owner = response.data.owner;
             		node.detail.ownerType = response.data.ownerType;
             		node.detail.isLoadingInfo = false;
             	}, function(error){
             		node.detail = "Error";
        	    	node.message = formatErrorMessage(error);
        	    });
    		 };
    		 
    		 var selectTable = function(node){
     			console.debug("selectDatabase", node);
     			scope.selectedNode = node;
     			if(!node.detail && node.detail==null)
     				loadTableDetail(node);
     		};
     		
			 var timestamp = new Date().getTime();

    		 /*
     		scope.selectedNode = createNode('table', {database:"yucca_metadata"}, 'dim_dataset');
     		scope.selectedNode.detail={preview: {
					isQueryRunning: false,
						jobStatus: null, //"FAILED",//"SUCCEEDED",
						jobComplete: false,
						query: "select * from yucca_metadata.dim_dataset limit 100",
						previewData: null,
						jobId: null,
						outputName: "BigdataExplorer_yucca_metadata_dim_dataset_"+timestamp+".output"
						}
     		};
     		
     		
      		if(scope.selectedNode.detail.preview.jobStatus == 'SUCCEEDED'){
      			var previewPath = "/user/sdp/BigdataExplorer_yucca_metadata_dim_dataset_1476369914910.output/stdout";
      			console.log("previewPath",previewPath);
            	hdfsService.previewFile(previewPath).then(function (response) {
        	    	console.log("response", response);
    	    		var lines = response.data.match(/[^\r\n]+/g);
    	    		scope.selectedNode.detail.preview.previewData = [];
    	    		for(var i=0; i<lines.length;i++){
    	    			//var cols = lines[i].split('\t');
    	    		//	for(var j=0; j<cols.length; j++)
    	    		//		row += "<td>" + cols[j] + "</td>";
    	    			scope.selectedNode.detail.preview.previewData.push(lines[i].split('\t'));
    	    		}
        	    }, function(response){
        	    	console.error("response error", response);
                	scope.message = {type:"danger",title:"Unable to create the file preview",text:"<strong>" + response.status + "</strong> " + response.statusText};
        	    });
      		}
      		else if(scope.selectedNode.detail.preview.jobStatus == 'FAILED'){
      			var errorPath = "/user/sdp/ale3.output/stderr";
            	hdfsService.previewFile(errorPath).then(function (response) {
            		console.error("response error", response);
        	    	scope.selectedNode.detail.preview.errorLog = response.data;
	    	    }, function(response){
	    	    	console.error("response error", response);
	            	scope.message = {type:"danger",title:"Unable to load error log",text:"<p>Error log path: <code>/user/sdp/ale3.output/stderr</code></p><strong>" + response.status + "</strong> " + response.statusText};
	    	    });
      		}

     		*/
     		
     		
     		
     		
    		 var loadTableDetail = function(node){
    			 var timestamp = new Date().getTime();
    			 node.detail = {table : node.name, 
              					database : node.database,
              					columns: [],
              					isLoadingColumns: true,
              					isLoadingProperties: true,
              					properties : 
          							{numFiles:"-",
          								transient_lastDdlTime:"-",
          								COLUMN_STATS_ACCURATE:"-",
          								EXTERNAL: "-",
          								totalSize:"-",
          								numRows:"-",
          								rawDataSize:"-",
          								partitions: "-"
          							},
          						preview: {
          							isQueryRunning: false,
          							jobStatus: null,
          							jobComplete: false,
          							jobStartTime: null,
          							query: "select * from " +node.database + "." +node.name + " limit 100",
          							previewData: null,
          							previewDataHeader: null,
          							jobId: null,
          							outputName: "Bde_"+node.database+"_"+node.name+"_"+timestamp+".output"
          							}
    			 
          						};
              	node.message = null;
              	node.detail.isLoadingColumns = true;
              	hiveService.tableSingle(node.database, node.name).then(function (response) {
              		console.log("tableSingle", response);
              		node.detail.columns = response.data.columns;
              		node.detail.isLoadingColumns = false;
              		if(node.detail.columns == null || node.detail.columns.length==0)
              			node.detail.tableColumnMessage = {"type":"info", "text":"This table has no columns"};
              	},  function(error){
              		node.detail.tableColumnMessage = formatErrorMessage(error);
        	    });
              	
              	hiveService.tableSingleProperties(node.database, node.name).then(function (response) {
              		console.log("tableSingleProperties", response);
              		node.detail.properties.numFiles = response.data.properties.numFiles;
              		node.detail.properties.transient_lastDdlTime = response.data.properties.transient_lastDdlTime;
              		node.detail.properties.COLUMN_STATS_ACCURATE = response.data.properties.COLUMN_STATS_ACCURATE;
              		node.detail.properties.EXTERNAL = response.data.properties.EXTERNAL;
              		node.detail.properties.totalSize = response.data.properties.totalSize;
              		node.detail.properties.numRows = response.data.properties.numRows;
              		node.detail.properties.rawDataSize = response.data.properties.rawDataSize;
              		node.detail.properties.partitions = response.data.properties.partitions;
              		node.detail.isLoadingProperties = false;
              		
              		
              		console.log("node.detail.properties", node.detail.properties);
              	},  function(error){
              		node.detail.tablePropertiesMessage = formatErrorMessage(error);
        	    });
     		 };
             	
     		 
     		 var checkLimitInQuery = function(query){
     			 var result = false;
     			 var words = query.split(/\s+/);

     			 for(var i=0; i<words.length;i++){
     				 if(words[i]=='limit' || words[i]=='LIMIT' || words[i]=='Limit'){
 						try{
 							var value = parseInt(words[i+1]);
 							if(value>0 && value<101){
 								result = true;
 								break;
 							}
 						}catch (e) {
 							result = false;
 						}
     				 }
     			 }
     			 return result;
     		 };
     		 
     		 scope.runPreviewQuery = function(){
     			 
     			console.debug("runPreviewQuery", scope.selectedNode.detail.preview);
     			console.log("limit", scope.selectedNode.detail.preview.query.indexOf("limit"));
     			scope.selectedNode.detail.tablePreviewMessage = null;
     			if(scope.selectedNode.detail.preview.query==""){
     				selectedNode.detail.tablePreviewMessage = {type:"warning",title:"Invalid query",text:"Enter a query"};
     			}
     			else if(scope.selectedNode.detail.preview.query.indexOf("limit") == -1){
     				scope.selectedNode.detail.tablePreviewMessage = {type:"warning",title:"Invalid query",text:"A <strong>limit clause</strong> is required (e.g select * from table limit 100). <strong>Max</strong> limit accepted <strong>100</strong> rows"};
     			}
     			else if(!checkLimitInQuery(scope.selectedNode.detail.preview.query)){
     				scope.selectedNode.detail.tablePreviewMessage = {type:"warning",title:"Invalid query",text:"The max limit accepted is 100 rows"};
     			}
     			else{
         			scope.selectedNode.detail.preview.isQueryRunning = true;
	     			scope.selectedNode.detail.preview.jobStatus = "LAUNCHED";
	     			hiveService.runQueryPreview(scope.selectedNode.detail.preview.query, scope.selectedNode.detail.preview.outputName).then(function (response) {
	     				console.log("runPreviewQuery response", response);
	         			scope.selectedNode.detail.preview.isQueryRunning = false;
	         			scope.selectedNode.detail.preview.jobId = response.data.id;
	     			},function(error){
	     				scope.selectedNode.detail.tablePreviewMessage = formatErrorMessage(error);
	         			scope.selectedNode.detail.preview.isQueryRunning = false;
	         			scope.selectedNode.detail.preview.isJobRunning = false;
	
	        	    });
     			}
     			
     		 };
     		 
     		 
     		 
     		 scope.checkPreview = function(){
      			console.debug("checkPreview", scope.selectedNode.detail.preview.query);
      			scope.selectedNode.detail.preview.jobLastCheck = new Date().getTime();
      			hiveService.jobSingle(scope.selectedNode.detail.preview.jobId ).then(function (response) {
              		console.log("jobSingle", response);
              		scope.selectedNode.detail.preview.jobStatus = response.data.status.state;
         			scope.selectedNode.detail.preview.jobComplete = response.data.status.jobComplete;
         			scope.selectedNode.detail.preview.jobStartTime = response.data.status.startTime;
              		if(scope.selectedNode.detail.preview.jobStatus == 'SUCCEEDED'){
              			var previewPath = "/user/" + response.data.user+"/"+scope.selectedNode.detail.preview.outputName + "/stdout";
              			console.log("previewPath",previewPath);
                    	hdfsService.previewFile(previewPath).then(function (response) {
                	    	console.log("response", response);
            	    		var lines = response.data.match(/[^\r\n]+/g);
            	    		scope.selectedNode.detail.preview.previewData = [];
            	    		if(lines && lines.length>1){
            	    			scope.selectedNode.detail.preview.previewDataHeader=lines[0].split('\t');
	            	    		for(var i=1; i<lines.length;i++){
	            	    			scope.selectedNode.detail.preview.previewData.push(lines[i].split('\t'));
	            	    		}
            	    		}
                	    }, function(response){
                	    	console.error("response error", response);
                        	scope.message = {type:"danger",title:"Unable to create the file preview",text:"<strong>" + response.status + "</strong> " + response.statusText};
                	    });
              			
              		}
              		else if(scope.selectedNode.detail.preview.jobStatus == 'FAILED'){
              			var errorPath = "/user/" + response.data.user+"/"+scope.selectedNode.detail.preview.outputName + "/stderr";
                    	hdfsService.previewFile(errorPath).then(function (response) {
                    		console.error("response error", response);
                	    	scope.selectedNode.detail.preview.errorLog = response.data;
        	    	    }, function(response){
        	    	    	console.error("response error", response);
        	            	scope.message = {type:"danger",title:"Unable to load error log",text:"<p>Error log path: <code>/user/sdp/ale3.output/stderr</code></p><strong>" + response.status + "</strong> " + response.statusText};
        	    	    });
              		}
              	},  function(error){
              		selectedNode.detail.tablePropertiesMessage = formatErrorMessage(error);
        	    });
      			//scope.selectedNode.detail.preview.isJobRunning = false;
      			
     		 };
     		 
     		scope.newPreviewQuery = function(){
     			scope.selectedNode.detail.preview.isQueryRunning = false;
     			scope.selectedNode.detail.preview.jobStatus = null;
     			scope.selectedNode.detail.preview.jobComplete = false;
     			scope.selectedNode.detail.preview.jobStartTime = null;
     			scope.selectedNode.detail.preview.query = "select * from " +node.database + "." +node.name + " limit 100";
     			scope.selectedNode.detail.preview.previewData = null;
     			scope.selectedNode.detail.preview.previewDataHeader = null;
     			scope.selectedNode.detail.preview.jobId = null;
     			scope.selectedNode.detail.preview.outputName = "Bde_"+node.database+"_"+node.name+"_"+timestamp+".output";
     		};

            var scrollTo = function(parentId, elementId) {
            	setTimeout(function() {
            		var element = angular.element(document.querySelector( '#' + elementId));
                    console.log("element", elementId);
                    angular.element(document.querySelector( '#' + parentId ))[0].scrollTop = element.prop('offsetTop');
                    console.log("parent", angular.element(document.querySelector( '#' + parentId )));
            	}, 0);
                
            };
            
            var addChilds = function(nodeType, parentNode, childs){
            	for(var i=0;i<childs.length; i++){
            		parentNode.children.push(createNode(nodeType, parentNode, childs[i]));
        		}
            	console.log("addChilds",scope.tree);
            };

            scope.selectNode = function(fromNode){
            	console.debug("fromNode", fromNode);
            	fromNode.isOpen = !fromNode.isOpen;
	            if(fromNode.nodeType==Constants.HIVE_NODE_TYPES.root.name){
            		selectRoot(fromNode);
            	}
            	else if(fromNode.nodeType==Constants.HIVE_NODE_TYPES.database.name){
            		selectDatabase(fromNode);

            	}
            	else if(fromNode.nodeType==Constants.HIVE_NODE_TYPES.table.name){
            		selectTable(fromNode);
            	}
            };
            
            scope.start = function(){
            	scope.selectNode(scope.tree);
            	scope.started=true;
            };
            
            scope.start();
            
            
           
            
           
            
            scope.logout = function(){
            	
            	hiveService.logout().then(function (response) {
            		scope.started = false;
            		var startpath = null;
            	 }, function(response){
	        	    	console.error("response error", response);
	                	scope.message = {type:"danger",title:"Logout failed",text:"Unable to logout <strong>" + response.status + "</strong> " + response.statusText +"</br><p>Close the browser</p>"};
	        	 });

            };

            
            scope.refresh = function(){
            	 scope.tree.children = [];
            	 scope.start();
            };
            
        }

    };
}]);

bigdataExplorerTemplatesModule.run(["$templateCache", function($templateCache) {
  $templateCache.put("template/hive-explorer.html",
    '<div class="explorer-header-toolbar clearfix" ng-show="started">\n'+ 
    '  <div>\n'+
    '     <div class="pull-left toolbar-panel"> \n'+
    '       <a class="" href ng-click="refresh();"><i class="glyphicon glyphicon-refresh"></i> Refresh</a>\n'+
   // '       <a class="" href ng-click="browseToHome();"><i class="glyphicon glyphicon-home"></i> Home</a> \n'+
   // '       <a class="" ng-show="supportsStorage()" href ng-click="showFavoritePanel=true"><i class="glyphicon glyphicon-star"></i> Favorites</a> \n'+
    '     </div>\n'+
    '     <div class="pull-right">\n'+
    //'       <div>User <strong>{{username}}</strong></div>\n'+
    '       <div><a class="" href ng-click="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></div>\n'+ 
    '     </div>\n' +
    '  </div>\n' +
    '</div>' +
    
    
	'<div class="explorer-start-panel row" ng-show="!started">\n' + 
    '  <div class="col-sm-8  explorer-start-intro">\n' + 
    '    Insert user and password, or bind them using \n' + 
    '    <a href="http://zeppelin.apache.org/docs/0.6.1/displaysystem/front-end-angular.html" target="_blank"><code>z.angularBind</code></a> if you are using \n' + 
    '    <a hre="https://zeppelin.apache.org/" target="_blank"><strong>Apache Zeppelin</strong></a>\n' + 
    '  </div>\n'+ 
    '</div>\n'+
    '<div class="row explorer-wrapper" ng-show="started">\n' + 
    '  <div class="col-sm-8 col-sm-offset-4">\n'+
    '    <p> \n'+
    '      <span ng-show="selectedNode.database!=null" class="hive-breadcumb-item"><i class="icon icon-database"></i> {{selectedNode.database}}</span> \n'+
    '      <span ng-show="selectedNode.nodeType == \'table\'" class="hive-breadcumb-item"><i class="icon icon-table"></i> {{selectedNode.name}}</span> \n'+
    '    </p>\n' + 
    '  </div>\n'+
    '  <div class="col-sm-4 hive-tree-panel" id="hive-tree-panel">\n'+
    '     <a href ng-click="start()">\n'+
	'  		<i ng-class="tree.icon" class="item-icon"></i> {{tree.label}}\n'+
	'    </a> \n' +
    // tree view
	'    <div class="spinner" ng-show="tree.isLoading">Loading databases&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>    \n' +
    '    <ul class="hive-tree-list"> \n' +
    '      <li ng-repeat="child in tree.children track by $index" ng-include="\'template/hive-tree-view.html\'" ></li> \n' +
    '    </ul> \n'+
    '  </div>\n'+
    '  <div class="col-sm-8 view-panel">\n'+
    '	 <div class="alert alert-{{selectedNode.message.type}}" role="alert" ng-show="selectedNode.message!=null"><span ng-bind-html="selectedNode.message.text"></span></div>\n'+
    //   root detail - system info
    '    <div id="hive-system-info" ng-show="selectedNode.nodeType == \'root\'"> \n' +
    ' 		<h1 class="title-icon">System Info</h1>	\n' +
    '    	<table class="table hive-system-info-table" >\n'+
    '         <tbody>\n'+
    '          <tr><td><i class="icon icon-hadoop"></i><td><strong>Hadoop</strong></td><td>Version</td><td>{{selectedNode.detail.hadoop_version}}</td></tr>\n'+
    '          <tr><td><i class="icon icon-hive"></i><td><strong>Hive</strong></td><td>Version</td><td>{{selectedNode.detail.hive_version}}</td></tr>\n'+
    '          <tr><td rowspan="2"><i class="icon icon-webhcat"></i></td><td rowspan="2"><strong>WebHCat</strong></td><td>Version</td><td>{{selectedNode.detail.webhcat_version}}</td></tr>\n'+
    '          <tr><td>Status</td><td>{{selectedNode.detail.webhcat_status}}</td></tr>\n'+
    '        </tbody>\n'+
    '      </table>\n'+
    '    </div>\n'+
    //   database detail
    '    <div id="hive-database-detail" ng-show="selectedNode.nodeType == \'database\'"> \n' +
    ' 		<h2 class="title-icon"><i class="icon icon-database"></i>Database <strong>{{selectedNode.name}}</strong></h2>	\n' +
    //'	    <div class="alert alert-{{selectedNode.message.type}}" role="alert" ng-show="selectedNode.message!=null"><span ng-bind-html="selectedNode.message.text"></span></div>\n'+
	'       <div class="spinner" ng-show="selectedNode.detail.isLoadingInfo">Loading info&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>    \n' +
    '    	<table class="table" ng-show="!selectedNode.detail.isLoadingInfo && selectedNode.detail!=null">\n'+
    '         <tbody>\n'+
    '          <tr><td><strong>Location</td><td><span ng-bind-html="selectedNode.detail.location"></span></td></tr>\n'+
    '          <tr><td><strong>Owner</td><td><span ng-bind-html="selectedNode.detail.owner"></span></td></tr>\n'+
    '          <tr><td><strong>Owner Type</td><td><span ng-bind-html="selectedNode.detail.ownerType"></span></td></tr>\n'+
    '        </tbody>\n'+
    '      </table>\n'+
    '    </div>\n'+
    // table detail
    '    <div id="hive-table-detail" ng-show="selectedNode.nodeType == \'table\'"> \n' +
    ' 		<h2 class="title-icon"><i class="icon icon-table"></i> Table <strong>{{selectedNode.name}}</strong> </h2>	\n' +
    '       <ul class="clearfix tab-bar nav nav-tabs" ng-init="currentTableDetailTab=\'tableStructure\'">\n'+
    '         <li class="tab-item" ng-class="currentTableDetailTab == \'tableStructure\'?\'active\':\'\'"><a href ng-click="currentTableDetailTab=\'tableStructure\'">Structure</a></li>\n'+
    '         <li class="tab-item" ng-class="currentTableDetailTab == \'tableProperties\'?\'active\':\'\'"><a href ng-click="currentTableDetailTab=\'tableProperties\'">Properties</a></li>\n'+
    '         <li class="tab-item" ng-class="currentTableDetailTab == \'tablePreview\'?\'active\':\'\'"><a href ng-click="currentTableDetailTab=\'tablePreview\'">Data preview</a></li>\n'+
    '       </ul>\n'+
    //     table detail columns
    '       <div class="tab-panel" ng-show="currentTableDetailTab==\'tableStructure\'" >\n'+     
    '	      <div class="alert alert-{{selectedNode.detail.tableColumnMessage.type}}" role="alert" ng-show="selectedNode.detail.tableColumnMessage!=null"><span ng-bind-html="selectedNode.detail.tableColumnMessage.text"></span></div>\n'+
	'         <div class="spinner" ng-show="selectedNode.detail.isLoadingColumns">Loading columns&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>    \n' +
    '    	  <table class="table" ng-show="selectedNode.detail.columns.length>0">\n'+
    '           <thead>\n'+
    '             <tr><th class="text-muted">#</th><th>Name</th><th>Type</th></tr>\n'+
    '           </thead>\n'+
    '           <tbody>\n'+
    '             <tr ng-repeat="col in selectedNode.detail.columns track by $index"><td class="text-muted">{{$index+1}}</td><td><strong>{{col.name}}</strong></td><td>{{col.type}}</td></tr>\n'+
    '           </tbody>\n'+
    '         </table>\n'+
    '       </div>\n'+
    //     table detail properties
    '       <div class="tab-panel" ng-show="currentTableDetailTab==\'tableProperties\'" >\n'+     
    '	      <div class="alert alert-{{selectedNode.detail.tablePropertiesMessage.type}}" role="alert" ng-show="selectedNode.detail.tablePropertiesMessage!=null"><span ng-bind-html="selectedNode.detail.tablePropertiesMessage.text"></span></div>\n'+
	'         <div class="spinner" ng-show="selectedNode.detail.isLoadingProperties">Loading properties&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>    \n' +
    '    	  <table class="table" ng-show="!selectedNode.detail.isLoadingProperties">\n'+
    '           <tbody>\n'+
    '             <tr><td><strong>numFiles</strong></td><td>{{selectedNode.detail.properties.numFiles}}</td></tr>\n'+
    '             <tr><td><strong>transient_lastDdlTime</strong></td><td>{{selectedNode.detail.properties.transient_lastDdlTime*1000|date:"dd/MM/yyyy H:mm:ss"}}</td></tr>\n'+
    '             <tr><td><strong>COLUMN_STATS_ACCURATE</strong></td><td>{{selectedNode.detail.properties.COLUMN_STATS_ACCURATE}}</td></tr>\n'+
    '             <tr><td><strong>EXTERNAL</strong></td><td>{{selectedNode.detail.properties.EXTERNAL}}</td></tr>\n'+
    '             <tr><td><strong>totalSize</strong></td><td>{{selectedNode.detail.properties.totalSize|format_filesize}}</td></tr>\n'+
    '             <tr><td><strong>numRows</strong></td><td>{{selectedNode.detail.properties.numRows}}</td></tr>\n'+
    '             <tr><td><strong>numCols</strong></td><td><span ng-show="selectedNode.detail.columns.length>0">{{selectedNode.detail.columns.length}}</span></td></tr>\n'+
    '             <tr><td><strong>rawDataSize</strong></td><td>{{selectedNode.detail.properties.rawDataSize|format_filesize}}</td></tr>\n'+
    '             <tr><td><strong>partitions</strong></td><td>{{selectedNode.detail.properties.partitions}}</td></tr>\n'+
    '           </tbody>\n'+
    '         </table>\n'+
    '       </div>\n'+    
    '       <div class="tab-panel hive-query-preview-tab" ng-show="currentTableDetailTab==\'tablePreview\'">\n'+     
    '	      <div class="alert alert-{{selectedNode.detail.tablePreviewMessage.type}}" role="alert" ng-show="selectedNode.detail.tablePreviewMessage!=null"><span ng-bind-html="selectedNode.detail.tablePreviewMessage.text"></span></div>\n'+
    '	      <form class="form-horizontal" ng-show="selectedNode.detail.preview.jobStatus==null" ng-submit="runPreviewQuery()">\n'+
    '	        <div class="form-group">\n'+
    '	          <label for="previewQueryInput" class="col-sm-2 control-label">Query</label>\n'+
    '	          <div class="col-sm-8"><input readonly type="text" class="form-control" id="previewQueryInput" placeholder="e.g select * from database.table" ng-model="selectedNode.detail.preview.query"></div>\n'+
    '	          <div class="col-sm-2"><button type="submit" class="btn btn-default" >Run query</button></div>\n'+
    '	        </div>\n'+
    '	      </form>\n'+
    '         <div ng-show="selectedNode.detail.preview.jobStatus!=null">\n'+
    '           <p>Query <code>{{selectedNode.detail.preview.query}}</code></p>\n'+
	'           <div class="spinner" ng-show="selectedNode.detail.preview.isQueryRunning">Query launched&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>\n' +
	'           <p ng-show="!selectedNode.detail.preview.isQueryRunning"> \n'+
	'              <span><strong>Job</strong> {{selectedNode.detail.preview.jobId}}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;\n'+
	'              <strong>Status</strong> <span class="hive-job-status-{{selectedNode.detail.preview.jobStatus}}">{{selectedNode.detail.preview.jobStatus}}</span> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;\n'+
	'              <strong>Start time</strong> {{selectedNode.detail.preview.jobStartTime|date:"dd/MM/yyyy HH:mm:ss"}}</span> \n'+
	'           </p>\n'+ 
	'           <p ng-show="!selectedNode.detail.preview.jobComplete"> \n'+
	'             The job is running, it may take several seconds to finish. \n'+
	'             <a class="btn btn-default" href ng-click="checkPreview()" ng-show="!selectedNode.detail.preview.isQueryRunning && !selectedNode.detail.preview.jobComplete">Check if it finished</a> \n'+
	'              &nbsp;&nbsp;&nbsp;<span class="text-muted" ng-show="selectedNode.detail.preview.jobLastCheck!=null">\n'+
	'              Last check {{selectedNode.detail.preview.jobLastCheck|date:"dd/MM/yyyy HH:mm:ss"}}</span>'+
	'           </p>\n'+ 
	'           <div ng-show="selectedNode.detail.preview.jobComplete">\n' +
    '             <div ng-show="selectedNode.detail.preview.jobStatus==\'SUCCEEDED\'">' +
    '               <div ng-show="selectedNode.detail.preview.previewData.length==0">The query did not return rows</div>\n' +
    '               <div ng-show="selectedNode.detail.preview.previewData.length>0" class="hive-preview-table">'+
    '                 <table class="table table-condensed table-bordered table-preview">'+
    '					<thead><tr><th>&nbsp;</th><th ng-repeat="cell in selectedNode.detail.preview.previewDataHeader track by $index">{{cell}}</th></tr></thead>'+
    '					<tbody><tr ng-repeat="row in selectedNode.detail.preview.previewData track by $index"><td class="row-num">{{$index+1}}</td><td ng-repeat="cell in row track by $index" title="{{cell}}">{{cell|string_ellipse:40}}</td></tr></tbody>'+
    '                 </table>'+
    '               </div>\n' +
    '             </div>' +
    '             <div ng-show="selectedNode.detail.preview.jobStatus==\'FAILED\'">' +
    '             	<div class="panel panel-danger panel-scroll"><div class="panel-heading">Job failed</div> \n'+
    '                 <div class="panel-body" ng-bind-html="selectedNode.detail.preview.errorLog"></div>\n'+
    '                 </div>' + 
    '             </div>' +
    '             <p class="text-right"> <a class="btn btn-default" href ng-click="newPreviewQuery()">Run an other preview query </a></p>' +
    '           </div>' +
    '         </div>' +
    '      </div>\n'+    
    
    
    '    </div>\n'+
    '  </div>\n'+
    '</div>\n'+

    '<div class="panel panel-{{message.type}} alert-main" ng-show="message!=null">\n'+
    '  <div class="panel-heading">{{message.title}} <span class="close" ng-click="message = null">&times;</span></div>\n'+
    '  <div class="panel-body"><p><span ng-bind-html="message.text"></span></p><div class="text-center"><a href ng-click="message = null" class="btn btn-default">Close</a></div></div>\n'+
    '</div>\n' );	    		

  
  $templateCache.put("template/hive-tree-view.html",
	'<a   id="{{child.viewId}}" href ng-click="child.loadChildren()" ng-class="selectedNode.name == child.name?\'hive-tree-item-selected\':\'\'">\n'+
	'  <i class="{{child.icon}}"></i> {{child.label}}\n'+
	'</a> \n' +
	'<div class="spinner" ng-show="child.isLoading">Loading tables&hellip; &nbsp;&nbsp;<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>    \n' +
	'<ul class="hive-tree-list" ng-show="child.isOpen"> \n' +
	'   <li ng-repeat="child in child.children track by $index" ng-include="\'template/hive-tree-view.html\'">\n'+
	'   </li>\n'+  
	'</ul> \n'
  );
}]);

