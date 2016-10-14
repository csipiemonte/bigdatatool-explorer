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



