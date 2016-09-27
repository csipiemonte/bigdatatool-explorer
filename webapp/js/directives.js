'use strict';

var appDirectives = angular.module('bigdataNavigator.directives', []);
appDirectives.directive('mainHeader', function() {
	return {
		restrict : 'E',
		templateUrl : 'partials/main-header.html',
	};
});

appDirectives.directive('mainFooter', function() {
	return {
		restrict : 'E',
		templateUrl : 'partials/main-footer.html',
	};
});