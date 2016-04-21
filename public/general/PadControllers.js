'use strict';

/* Controllers */

var padApp = angular.module('padApp', []);
// inline anotation for prevent minifier issues
// https://scotch.io/tutorials/declaring-angularjs-modules-for-minification

padApp
		.controller(
				'PadCtrl',
				function($scope, AWSService, $http, $window, $q) {
					$scope.isAuthenticated = false;

					$scope.user = {
						email : 'awfulnice@gmail.com',
						accessKeyId : '',
						secretAccessKey : ''
					};

					$scope.instance = {};

					// TODO: to service
					$scope.submit = function() {

						$http
								.post('/authenticate', $scope.user)
								.success(
										function(data, status, headers, config) {
											$window.sessionStorage.token = data.token;
											$scope.isAuthenticated = true;
											var encodedProfile = data.token
													.split('.')[1];
											var profile = JSON
													.parse(url_base64_decode(encodedProfile));

											console.log(profile);
											console.log(data.token);
											// TODO: authenticate users
											$scope.isAuthenticated = true;

											$scope.initialice();

										})
								.error(
										function(data, status, headers, config) {
											// Erase the token if the user fails
											// to log in
											delete $window.sessionStorage.token;
											$scope.isAuthenticated = false;

											// Handle login errors here
											$scope.error = 'Error: Invalid user or password';
											$scope.welcome = '';
										});

						console.log('submit');
					}

					$scope.callRestricted = function() {
						$http({
							url : '/api/restricted',
							method : 'GET'
						}).success(function(data, status, headers, config) {
							$scope.message = $scope.message + ' ' + data.name; // Should
							// log
							// 'foo'
						}).error(function(data, status, headers, config) {
							alert(data);
						});
					};

					$scope.logout = function() {

						$scope.isAuthenticated = false;
						delete $window.sessionStorage.token;
					};

					$scope.describeInstance = function() {
						AWSService.describeInstance();
					};

					$scope.waitFor = function() {
						$scope.message = "pending";

						// TODO: control ERR_EMPTY_RESPONSE
						// TODO: check if reachability checks fails
						// If this check fails, you may need to reboot your
						// instance or make modifications to your operating
						// system configuration.
						AWSService.waitFor('instanceStatusOk',
								$scope.instance.InstanceId).then(
								function(status) {
									console.log(status);
									$scope.message = 'instanceStatusOk';

								});
						AWSService
								.waitFor('instanceRunning',
										$scope.instance.InstanceId)
								.then(

										function(status) {
											console.log(status);
											$scope.publicDnsName = status.data.status.Reservations[0].Instances[0].PublicDnsName;
											$scope.message = 'instanceRunning';
										});

					};

					$scope.stop = function() {
						AWSService.stop();
					};

					$scope.initialice = function() {

						// start image
						var resultStart = AWSService.start();

						var promise = $q.all({
							promiseResultStart : resultStart,
						// promiseOpenHTTPPort : openHTTPPort,
						});
						promise
								.then(
										function(result) {
											console
													.log(result.promiseResultStart.data);

											$scope.instance = result.promiseResultStart.data.instanceStatus.Instances[0];

											// monitors state of the instance...
											// Display to the user sequentially,
											// showing
											$scope.waitFor();

											// console.log(result.promiseResultStart.data.instances[0].State.Name);

										}, function(error) {
											console.log(error);
											$scope.message = error.data;
										});

					}

				});

// this is used to parse the profile
function url_base64_decode(str) {
	var output = str.replace('-', '+').replace('_', '/');
	switch (output.length % 4) {
	case 0:
		break;
	case 2:
		output += '==';
		break;
	case 3:
		output += '=';
		break;
	default:
		throw 'Illegal base64url string!';
	}
	return window.atob(output); // polifyll
	// https://github.com/davidchambers/Base64.js
}
// TODO: to another file

padApp.factory('authInterceptor', function($rootScope, $q, $window) {
	return {
		request : function(config) {
			config.headers = config.headers || {};
			if ($window.sessionStorage.token) {
				config.headers.Authorization = 'Bearer '
						+ $window.sessionStorage.token;
			}
			return config;
		},
		responseError : function(rejection) {
			if (rejection.status === 401) {
				// handle the case where the user is not authenticated
			}
			return $q.reject(rejection);
		}
	};
});

padApp.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
});
