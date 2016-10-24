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

bigdataExplorerFilter.filter('string_ellipse', function () {
    return function (text, length, end) {
    	
    	if(typeof text === "undefined"  || text == null)
    		text = "";
    	
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }
    };
});
