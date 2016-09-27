'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('bigdataNavigator', [
  'ngRoute',
  'ngSanitize',
  'bigdata-explorer.plugin',
  'bigdataNavigator.filters',
  'bigdataNavigator.services',
  'bigdataNavigator.directives',
  'bigdataNavigator.controllers',
  'pascalprecht.translate',
]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', {templateUrl: 'partials/home.html?'});
	$routeProvider.otherwise({redirectTo: '/home'});
}]);


app.config(['$translateProvider', function ($translateProvider) {
	// add translation table
	$translateProvider
	.translations('en', translations_en)
	.translations('it', translations_it)
	.preferredLanguage('it');

	$translateProvider.useSanitizeValueStrategy();
}]);


//app.config(['$httpProvider', function($httpProvider) {
//    $httpProvider.defaults.useXDomain = true;
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//}
//]);