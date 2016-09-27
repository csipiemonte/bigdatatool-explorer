'use strict';

var appFilters = angular.module('bigdataNavigator.filters', []);

appFilters.filter('format_filesize', function() {
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