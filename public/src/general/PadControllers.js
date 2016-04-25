/* Controllers */

var padApp = angular.module('padApp', []);
// inline anotation for prevent minifier issues
// https://scotch.io/tutorials/declaring-angularjs-modules-for-minification

padApp
		.controller(
				'PadCtrl',
				[
						'$scope',
						'AWSService',
						'$http',
						'$window',
						'$q',
						function($scope, AWSService, $http, $window, $q) {
							'use strict';

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
												function(data, status, headers,
														config) {
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

													$scope.startAMI();

												})
										.error(
												function(data, status, headers,
														config) {
													// Erase the token if the
													// user fails
													// to log in
													delete $window.sessionStorage.token;
													$scope.isAuthenticated = false;

													// Handle login errors here
													$scope.error = 'Error: Invalid user or password';
												});

								console.log('submit');
							};

							$scope.callRestricted = function() {
								$http({
									url : '/api/restricted',
									method : 'GET'
								})
										.success(
												function(data, status, headers,
														config) {
													$scope.message.desc = $scope.message.desc
															+ ' ' + data.name;
												}).error(
												function(data, status, headers,
														config) {
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

							// Monitors state of the instance...
							// Display state sequentially to the user. First
							// instance is running, then test reachability
							$scope.waitFor = function() {

								// TODO: check if reachability checks fails.
								// Deal with ERR_EMPTY_RESPONSE
								// If this check fails, you may need to reboot
								// your
								// instance or make modifications to your
								// operating
								// system configuration.

								AWSService
										.waitFor('instanceRunning',
												$scope.instance.InstanceId)
										.then(
												function(status) {

													// console.log(status);
													$scope.publicDnsName = status.data.status.Reservations[0].Instances[0].PublicDnsName;
													$scope.message.desc = 'Instance Running. Public DNS:'
															+ $scope.publicDnsName;

													// Now we are sure the
													// instance is
													// running...

													return AWSService
															.waitFor(
																	'instanceStatusOk',
																	$scope.instance.InstanceId);
												})
										.then(
												function(status) {
													// Now we can access the
													// instance.
													$scope.enableDnsLink = true;
													$scope.message.desc = 'Instance	Reachable!';
													// change color message to
													// green
													$scope.message.type = 'success';
												},
												function(err) {
													console.log(err);
													// Unexpected error: i.e:
													// ERR_EMPTY_RESPONSE
													$scope.message.desc = 'Unexpected error!';
													$scope.message.type = 'danger';
												});
							};

							// stop a instances
							$scope.stop = function() {
								AWSService.stop();
							};

							// Start new Bitnami Wordpress instance.
							$scope.startAMI = function() {
								// // show first state message
								$scope.message = {
									desc : 'Instance pending...',
									type : 'info'
								};
								// test if security group exists and add inbound
								// rules
								AWSService
										.openHTTPPort()
										.then(
												function(res) {
													AWSService
															.start(
																	res.data.GroupId)
															.then(
																	function(
																			res) {
																		// console.log(res);

																		$scope.instance = res.data.instanceStatus.Instances[0];

																		// answer
																		// about
																		// state
																		$scope
																				.waitFor();

																		// //
																		//
																		// }).catch(function(err){
																		// $scope.message.desc
																		// =
																		// err.data;
																		// $scope.message.type
																		// =
																		// 'danger';
																		// //
																		// TODO:
																		// just
																		// //
																		// for
																		// show
																		// the
																		// //
																		// error!
																		// $scope.instance={};
																		//																
																	},
																	// TODO: Test
																	function(
																			err) {
																		$scope.message.desc = err.data;
																		$scope.message.type = 'danger';
																	})

												});
							};
						} ]);

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

padApp.factory('authInterceptor', [
		'$rootScope',
		'$q',
		'$window',
		function($rootScope, $q, $window) {
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
		} ]);

padApp.config([ '$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
} ]);
