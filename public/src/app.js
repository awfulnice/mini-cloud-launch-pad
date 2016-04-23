
/* App Module */

angular.module('launchPadApp', [ 'ngRoute',
// 'padAnimations',
'padServices', 'padApp', 'ui.bootstrap'
// 'padFilters',

]).config([ '$routeProvider', function($routeProvider) {
	'use strict';
	$routeProvider.when('/launchPad', {
		templateUrl : '/src/general/launchPad.html',
		controller : 'PadCtrl'
	}).otherwise({
		redirectTo : '/launchPad'
	});
} ]);