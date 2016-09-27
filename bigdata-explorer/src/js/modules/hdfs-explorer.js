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
            	
            	//createFolderItem(rootFolder);
            
            
//            var createFolderItem = function(itemLoaded){
//            	var item = {};
//            	item.pathSuffix = itemLoaded.pathSuffix;
//            	item.children = [];
//            	item.fullpath = itemLoaded.fullpath + item.pathSuffix + "/" ;
//            	console.log("item", item);
//	    		item.loadChildren = function(){
//	    			console.log("loadChildren");
//	    			scope.selectNode(this.fullpath);
//	    		};
//	    		item.icon = item.type == "DIRECTORY"?"glyphicon glyphicon-folder-close":"glyphicon glyphicon-file";
//            	item.isOpen = true;
//	    		
//            	
//            	return item;
//            	
//            };
            
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
                var element = angular.element(document.querySelector( '#' + elementId));
                console.log("element", elementId);
                angular.element(document.querySelector( '#' + parentId ))[0].scrollTop = element.prop('offsetTop');
                console.log("parent", angular.element(document.querySelector( '#' + parentId )));
            };
            
          

            
            scope.selectNode = function(fromNode){
            	console.debug("fromNode", fromNode);
            	console.debug("fromPath", fromNode.fullpath);
            	if(fromNode.children.length==0){
	            	hdfsService.getPath(scope.username, password, fromNode.fullpath).then(function (response) {
	        	    	console.log("response", response.data.FileStatuses.FileStatus);
	        	    	scope.list =  response.data.FileStatuses.FileStatus;
	        	    	for (var i = 0; i < response.data.FileStatuses.FileStatus.length; i++) {
	        	    		
	        	    		var item = response.data.FileStatuses.FileStatus[i];
	        	    		item.fullpath = fromNode.fullpath + item.pathSuffix;
	        	    		item.viewId = fromNode.viewId + item.pathSuffix + "_";

	        	    		if(item.type == 'DIRECTORY')
	        	    			item.fullpath += "/" ;
	        	    		item.loadChildren = function(){scope.selectNode(this);};
	        	    		item.children = [];
	        	    		fromNode.children.push(item);
	        	    	}
	        	    	refreshFileList(fromNode);
	        	    	if(scope.pathToBrowse.length>0){
	        	    		var currentPath  = scope.pathToBrowse[0];
	        	    		scope.pathToBrowse.shift();
	        	    		scope.selectNode(findChildren(fromNode, currentPath));
	        	    	}
	        	    	else{
	        	    		scrollTo("folder-tree-panel", fromNode.viewId);
	        	    	}

	        	
	        	    }, function(response){
	        	    	console.error("getPath response error", response);
	        	    	scope.filelist= [];
	        	    	scope.filemessage = {"type":"danger", "text":"<strong>" + response.status + "</strong> " + response.statusText};
	        	    });
            	}
            	else{
            		refreshFileList(fromNode);
        	    	if(scope.pathToBrowse.length>0){
        	    		var currentPath  = scope.pathToBrowse[0];
        	    		console.info("c", currentPath);
        	    		scope.pathToBrowse.shift();
        	    		scope.selectNode(findChildren(fromNode, currentPath));
        	    		scrollTo("folder-tree-panel", fromNode.viewId);
        	    	}
            	}
    	    	
            	fromNode.isOpen = !fromNode.isOpen;
            	scope.selectedFolderPath = fromNode.fullpath;
            	
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

            
            
            //            scope.browseToHome = function(){
//            	hdfsService.getHomeDirectory(scope.username, password).then(function (response) {
//        	    	console.log("response", response);
//        	    	if(response!=null && response.data !=null && response.data.Path !=null){
//        	    		var folders = response.data.Path.split("/");
//        	    		var parentNode = scope.filetree;
//        	    		for (var i = 0; i < folders.length; i++) {
//        	    			console.log("folders", folders[i]);
//        	    			if(folders[i] != ""){
//	        	    			var childNode = findChildren(parentNode, folders[i]);
//	        	    			console.log("childNode",childNode);
//	        	    			parentNode = childNode;
//        	    			}
//            	    		//scope.selectNode(scope.filetree);
//						}
//        	    	}
//        	    }, function(response){
//        	    	console.error("browseToHome response error", response);
//        	    });
//            };
//            
//            scope.browseToNode = function(parentNode, path){
//        	    			if(folders[i] != ""){
//	        	    			var childNode = findChildren(parentNode, folders[i]);
//	        	    			console.log("childNode",childNode);
//	        	    			parentNode = childNode;
//        	    			}
//            	    		//scope.selectNode(scope.filetree);
//						}
//        	    	}
//        	    }, function(response){
//        	    	console.error("browseToHome response error", response);
//        	    });
//            };
//            
            
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

            };

            
            scope.refresh = function(){
            	 scope.filetree.children = [];
            	 scope.start();
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
    '     <div class="pull-left refresh-panel"> \n'+
    '       <a class="" href ng-click="refresh();"><i class="glyphicon glyphicon-refresh"></i> Refresh</a>\n'+
    '       <a class="" href ng-click="browseToHome();"><i class="glyphicon glyphicon-home"></i> Home</a> \n'+
    '     </div>\n'+
    '     <div class="pull-right">\n'+
    '       <div>User <strong>{{username}}</strong></div>\n'+
    '       <div><a class="" href ng-click="logout()"><i class="glyphicon glyphicon-log-out"></i> Logout</a></div>\n'+ 
    '     </div>\n' +
    '  </div>\n' +
    '</div>' +
    
    
	'<div class="explorer-start-panel row" ng-show="!started">\n' + 
    //'  <div class="col-sm-3"><a class="btn btn-primary" href ng-click="start()"><span>Start</span> <i class="glyphicon glyphicon-menu-right" ></i> </a></div>\n' + 
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
    '</div>\n'
  );	    		

  
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

