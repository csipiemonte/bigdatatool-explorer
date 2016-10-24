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

