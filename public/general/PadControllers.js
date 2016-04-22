'use strict';

/* Controllers */

var padApp = angular.module('padApp', []);
// inline anotation for prevent minifier issues
// https://scotch.io/tutorials/declaring-angularjs-modules-for-minification

padApp
		.controller(
				'PadCtrl',
				function($scope, AWSService, $http, $window, $q) {

					$scope.user = {
						email : 'awfulnice@gmail.com',
						accessKeyId : '',
						secretAccessKey : ''
					};

					// $scope.instance = {};

				
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
										});

						console.log('submit');
					}

					$scope.callRestricted = function() {
						$http({
							url : '/api/restricted',
							method : 'GET'
						}).success(
								function(data, status, headers, config) {
									$scope.message.desc = $scope.message.desc
											+ ' ' + data.name;
								}).error(
								function(data, status, headers, config) {
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
						$scope.message.desc = "pending";

						// TODO: control ERR_EMPTY_RESPONSE
						// TODO: check if reachability checks fails
						// If this check fails, you may need to reboot your
						// instance or make modifications to your operating
						// system configuration.

						AWSService
								.waitFor('instanceRunning',
										$scope.instance.InstanceId)
								.then(
										function(status) {

											console.log(status);
											$scope.publicDnsName = status.data.status.Reservations[0].Instances[0].PublicDnsName;
											$scope.message.desc = 'Instance Running. Public DNS:'
													+ $scope.publicDnsName;

											// Now we are sure the instance is
											// running...
											AWSService
													.waitFor(
															'instanceStatusOk',
															$scope.instance.InstanceId)
													.then(
															function(status) {
																console
																		.log(status);
																$scope.message.desc = 'Instance	Reachable!';
																// change color
																// message to
																// green
																$scope.message.type = 'success';
																$scope.enableDnsLink = true;

															});

										});

					};

					$scope.stop = function() {
						AWSService.stop();

					};
					$scope.initialice = function() {
						// show first state message
						$scope.message = {
								desc : 'Instance pending...',
								type : 'info'
							};
						// // test if security group exists and add inbound
						// rules
						AWSService
								.openHTTPPort()
								.then(
										function(res) {
											AWSService
													.start(res.data.GroupId)
													.then(
															function(res) {
																console
																		.log(res);
																$scope.instance = res.data.instanceStatus.Instances[0];
																
															
																// monitors
																// state of the
																// instance...
																// Display to
																// the user
																// sequentially,
																// showing
																$scope
																		.waitFor();

																//

															}).catch(function(err){
																$scope.message.desc = err.data;
																$scope.message.type = 'danger';
																//TODO: just for show the error!
																$scope.instance={};
																
															});

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
