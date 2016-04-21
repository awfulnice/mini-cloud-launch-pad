'use strict';

/* App Module */

angular.module('launchPadApp', [ 'ngRoute',
// 'padAnimations',
'padServices', 'padApp','ui.bootstrap'
// 'padFilters',

]).config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/launchPad', {
		templateUrl : 'general/launchPad.html',
		controller : 'PadCtrl'
	}).otherwise({
		redirectTo : '/launchPad'
	});
} ]);