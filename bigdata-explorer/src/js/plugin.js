angular.module('bigdata-explorer.plugin', [
  'bigdata-explorer',
  'bigdata-explorer.templates',
  'bigdata-explorer.utils',
  'bigdata-explorer.filters',
  'bigdata-explorer.services',
  'base64'
]);

var bigdataExplorerTemplatesModule = angular.module('bigdata-explorer.templates', ['bigdata-explorer.utils']);
var bigdataExplorerModule = angular.module('bigdata-explorer', ['bigdata-explorer.templates', 'bigdata-explorer.services']);
