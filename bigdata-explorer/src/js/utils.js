var yuccaUtilsModule = angular.module('bigdata-explorer.utils', []);

yuccaUtilsModule.factory('$bigdataExplorerHelpers', [function () {
	return{
		"attrs":{
			num : function(value, min, max, defaultValue){
				var result = value;
				if(isNaN(value) || value == null || value == "" ||
						(typeof min != 'undefined' && min !=null && value<min) || 
						(typeof max != 'undefined' && max !=null && value>max))
						result = defaultValue;
				return result;
			},
			safe: function(value, defaultValue){
				var result = value;
				if(typeof value == 'undefined' || value == null || value == '')
					result = defaultValue;
				return result;
			}
		},
		"utils":{
			isEmpty: function(input){
				return (typeof input == 'undefined' || input==null );
			},
			hex2Rgb: function(hex){
				if(hex.charAt(0)=="#") 
					hex = hex.substring(1,7);
				var r = parseInt((hex).substring(0,2),16);
				var g = parseInt((hex).substring(2,4),16);
				var b = parseInt((hex).substring(4,6),16);
				return r+","+g +","+b;
			},
			formatDateFromMillis: function(millis){
				var formattedDate = "";
				if(millis){
					var date   = new Date(millis);
					var d = date.getDate();
				    var m = date.getMonth() + 1;
				    var y = date.getFullYear();
				    var hh = date.getHours();
				    var mm = date.getMinutes();
					formattedDate = '' + (d <= 9 ? '0' + d : d) + '/' + (m<=9 ? '0' + m : m) + '/' + y + ' ' + (hh <= 9 ? '0' +hh : hh) + ":" +  (mm <= 9 ? '0' + mm : mm);
				}
				return formattedDate;
			},
			lZero: function(value){
				var result = "00";
				if(!isNaN(value)){
					result= (value <= 9 ? '0' + value : value);
				}
				return result;
				
			},
		    formatData: function(millis){
				var formattedDate = "";
				if(millis){
					var date   = new Date(millis);
					var d = date.getDate();
				    var m = date.getMonth() + 1;
				    var y = date.getFullYear();
				    var hh = date.getHours();
				    var mm = date.getMinutes();
				    var ss = date.getSeconds();
				    
					formattedDate = '' + y + '/' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + ' ' + (hh <= 9 ? '0' +hh : hh) + ":" +  (mm <= 9 ? '0' + mm : mm) + ":" + (ss <= 9 ? '0' + ss : ss);
				}

				return formattedDate;		    			
			},

		},
		"render": {
			safeTags : function (stringIn) {
				var outString = "";
				if((typeof stringIn != "undefined") && stringIn!=null){
					var typeStringIN = typeof stringIn;
					if (typeStringIN == "string")
						outString = stringIn.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
					else 
						outString = stringIn;
				}
			    return outString;   

			},
			linkify: function(stringIn) {
				var outString = "";
				if((typeof stringIn != "undefined") && stringIn!=null){
					var typeStringIN = typeof stringIn;
					if (typeStringIN == "string"){
					    var  replacePattern1, replacePattern2, replacePattern3;
				
					    //URLs starting with http://, https://, or ftp://
					    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
					    outString = stringIn.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
				
					    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
					    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
					    outString = outString.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
				
					    //Change email addresses to mailto:: links.
					    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
					    outString = outString.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
					} else 
						outString = stringIn;
				}

				return outString;
			}
		}		
	};

}]);

