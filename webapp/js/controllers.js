'use strict';

/* Controllers */

var appControllers = angular.module('bigdataNavigator.controllers', []);

appControllers.controller('GlobalCtrl', [ '$scope', '$translate', function($scope, $translate) {

	$scope.changeLanguage = function(langKey) {
		$translate.use(langKey);
	};
	
	
	$scope.hdfsExplorerDirectiveUrl ='partials/directives/hdfs-explorer.html?t='+new Date().getTime();
	
	$scope.message = null;
	
	$scope.user = {username:null, password: null};
	
	$scope.start = function(){
		$scope.message = null;
		if($scope.user.username==null || $scope.user.username=="" || $scope.user.password==null|| $scope.user.password==""){
			$scope.message = {type:"warning",text:"user_password_required"};
		}
		else
			$scope.hdfsExplorerDirectiveUrl ='partials/directives/hdfs-explorer.html?t='+new Date().getTime();
	}; 

	
	

}]);
