'use strict';

/* Controllers */

var appControllers = angular.module('bigdataNavigator.controllers', []);

appControllers.controller('GlobalCtrl', [ '$scope', '$translate', function($scope, $translate) {

	$scope.changeLanguage = function(langKey) {
		$translate.use(langKey);
	};
	
	
	$scope.hdfsExplorerDirectiveUrl ='partials/directives/hdfs-explorer.html?t='+new Date().getTime();
	$scope.hiveExplorerDirectiveUrl ='partials/directives/hive-explorer.html?t='+new Date().getTime();
	
	$scope.message = null;
			
	$scope.start = function(){
		$scope.message = null;
		$scope.hdfsExplorerDirectiveUrl ='partials/directives/hdfs-explorer.html?t='+new Date().getTime();
	}; 

	
	

}]);
