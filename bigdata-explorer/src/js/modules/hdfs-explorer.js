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
    	    	if(file.fileExt && (file.fileExt == "jpg" || file.fileExt == "tiff" || file.fileExt == "gif" || file.fileExt == "bmp" || file.fileExt == "png" || file.fileExt == "jpeg" || 
    	    		file.fileExt == "ogg" || file.fileExt == "mp4" || file.fileExt == "webm" || file.fileExt == "mp3" || file.fileExt == "aac")){

    	    		var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href',Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN");
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
    	    		scope.imgPreviewUrl =  Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN" ;
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":""};
    	    	}
    	    	else if(file.fileExt && (file.fileExt == "ogg" || file.fileExt == "mp4" || file.fileExt == "webm")){
    	    		var body = "<p class='file-preview-body'><video width='320' height='240' controls><source src='"+ Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN'></source></video></p><p><strong>File name:</strong> "+file.pathSuffix+"</p>";
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":body};
    	    	}
    	    	else if(file.fileExt && (file.fileExt == "mp3" || file.fileExt == "aac")){
    	    		var body = "<p class='file-preview-body'><audio width='320' height='240' controls><source src='"+ Constants.KNOX_BASE_URL+ file.fullpath + "?op=OPEN'></source></audio></p><p><strong>File name:</strong> "+file.pathSuffix+"</p>";
                    scope.modalPanelContent = {"title":"Preview of file " + file.pathSuffix, "body":body};
    	    	}
    	    	else{ 
	            	hdfsService.openFile(file.fullpath).then(function (response) {
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
                scope.started = false;
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
    //'       <div><a class="" href ng-click="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></div>\n'+ 
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

