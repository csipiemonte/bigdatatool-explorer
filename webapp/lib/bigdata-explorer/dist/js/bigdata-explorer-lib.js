var Constants = Constants || {};


Constants.KNOX_BASE_URL = "https://sdnet-knox.sdp.csi.it:8443/gateway/default/webhdfs/v1/";

Constants.KNOX_OPERATIONS = {"LIST":"LISTSTATUS", "OPEN": "OPEN", "GETHOMEDIRECTORY": "GETHOMEDIRECTORY"};

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
			   'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
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
            scope.username = attr.username;
            var password = attr.password;
            var startpath = attr.startpath;
            scope.pathToBrowse = [];
            
//            scope.$watch("username",function(newValue,oldValue) {
//                console.log("changed",newValue,oldValue);
//            });
            
            
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
	            				selectedNode.children[i].icon += " icon-" + selectedNode.children[i].pathSuffix.split('.').pop();
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
	            	hdfsService.getPath(scope.username, password, fromNode.fullpath).then(function (response) {
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
        	hdfsService.getHomeDirectory(scope.username, password).then(function (response) {
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

            
  
            scope.start = function(){
            	if(scope.username!=null && scope.username!=""){
            		scope.selectNode(scope.filetree);
            		//browseToHome();
            		scope.started=true;
            	}
            	else
            		scope.started=false;
            };
            
            scope.start();
            
            
            scope.openFile = function(file){
            	hdfsService.openFile(scope.username, password, file.fullpath).then(function (response) {
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
            };

            scope.previewFile = function(file){
            	hdfsService.openFile(scope.username, password, file.fullpath).then(function (response) {
        	    	console.log("response", response);
        	    	var body = "<p class='file-preview-body'>"+response.data+"</p>";
                    scope.modalPanelContent = {"title":"Preview of file file.pathSuffix", "body":body};
        	    }, function(response){
        	    	console.error("response error", response);
                	scope.message = {type:"danger",title:"Unable to create the file preview",text:"<strong>" + response.status + "</strong> " + response.statusText};
        	    });
            };
            
            scope.logout = function(){
                scope.started = false;
                scope.username = null;
                var password = null;
                var startpath = null;
                $http.defaults.headers.common.Authorization = 'Basic ';

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
    '       <a class="" href ng-click="browseToHome();"><i class="glyphicon glyphicon-home"></i> Home</a> \n'+
    '       <a class="" ng-show="supportsStorage()" href ng-click="showFavoritePanel=true"><i class="glyphicon glyphicon-star"></i> Favorites</a> \n'+
    '     </div>\n'+
    '     <div class="pull-right">\n'+
    '       <div>User <strong>{{username}}</strong></div>\n'+
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
    '    <p><strong translate>Full path</strong> <code>{{selectedFolderPath}}</code></p>\n' + 
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
    '              <!-- <a href ng-click="copyPath(file.fullpath)" title="Copy full path: {{file.fullpath}}"><i class="glyphicon glyphicon-copy"></i></a> -->\n'+
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
    '  <div class="panel-body"><p><span ng-bind-html="modalPanelContent.body"></span></p><div class="text-center"><a href ng-click="modalPanelContent = null" class="btn btn-default">Close</a></div></div>\n'+
    '</div>\n'+
    '</div>\n'+
    '<div class="panel panel-default modal-panel" ng-show="showFavoritePanel">\n'+
    '  <div class="panel-heading"><i class="glyphicon glyphicon-star"></i> Favorites<span class="close" ng-click="showFavoritePanel=false">&times;</span></div>\n'+
    '  <div class="panel-body">\n'+
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

