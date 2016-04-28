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
								password : '',
								account : '',
								accessKeyId : '',
								secretAccessKey : '',
								remember : false
							};

							// TODO: to service
							$scope.submit = function() {

								$http
										.post('/authenticate', $scope.user)
										.success(
												function(data, status, headers,
														config) {
													$window.sessionStorage.token = data.token;

													// TODO: authenticate users
													// and save user info and
													// credentials if remember
													// me is checked
													$scope.isAuthenticated = true;

													var encodedProfile = data.token
															.split('.')[1];
													var profile = JSON
															.parse(url_base64_decode(encodedProfile));

												//	console.log(profile);
													console.log(data.token);

													// invoque service directly
													$scope.startAMI();
												})
										.error(
												function(data, status, headers,
														config) {
													// Erase the token if the
													// user fails to log in

													delete $window.sessionStorage.token;
													$scope.isAuthenticated = false;

													// Handle login errors here
													$scope.error = 'Error: Invalid user or password';
												});

								console.log('submit');
							};

							// Just a test method
							$scope.callRestricted = function() {
								$http({
									url : '/api/restricted',
									method : 'GET'
								})
										.success(
												function(data, status, headers,
														config) {
													$scope.message.desc = $scope.message.desc + ' ' + data.name;
												}).error(
												function(data, status, headers,
														config) {
													alert(data);
												});
							};

							$scope.logout = function() {
								// we show login form and delete auth token
								$scope.isAuthenticated = false;
								delete $window.sessionStorage.token;
							};

							// Monitors state of the instance...
							// Display state sequentially to the user. First
							// instance is running, then test reachability
							$scope.waitFor = function() {

								// TODO: check if reachability checks fails.
								// Deal with
								// ERR_EMPTY_RESPONSE. If this check fails, you
								// may need to
								// reboot
								// your instance or make modifications to your
								// operating system
								// configuration.
								//			
								
								AWSService
										.waitFor('instanceRunning',
												$scope.instance.InstanceId)
										.then(
												function(status) {
													// we suppose we are
													// launching one instance...
													$scope.publicDnsName = status.data.status.Reservations[0].Instances[0].PublicDnsName;
													$scope.message = {
															desc : 'Instance Running. Waiting to complete reachability checks. Public DNS:'	+ $scope.publicDnsName,
															type : 'info' };
													

													// Now we are sure the
													// instance is running...

													
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
													$scope.message.desc = 'Instance Reachable!';
													$scope.message.type = 'success';
													// we control errors in both
													// calls to waitFor...
												}).catch(function(err){
													 console.log(err);
													$scope.message = {
														desc : 'Unexpected error!' + (err.data ? err.data : ''),
														type : 'danger' };
												});
							};
							
							// stop instance
							$scope.stop = function(instanceId) {
								$scope.message = {
										desc : 'Launching stop instance event...',
										type : 'info'
									};

								AWSService.stop(instanceId).then(
										function(data) {
											//console.log(data.data.data.TerminatingInstances[0].CurrentState.Name);
											$scope.enableDnsLink = false;
											$scope.message.desc = 'Shutting down...';
											$scope.message.type = 'info';
														
											return AWSService
											.waitFor(
													'instanceTerminated',
													instanceId).then(function(data){
														//console.log(data.data.status.Reservations[0].Instances[0]);
														$scope.message.desc = 'Instance Terminated!';
														$scope.message.type = 'success';
//													}, function(err){
//														console.log(data);
													});
											
										}).catch(function(err){
											 console.log(err);
											 $scope.message.desc = 'Unexpected error!' + (err.data ? err.data : '');
											 $scope.message.type = 'danger';
										});
							};
							//
							// Start new Bitnami Wordpress instance.
							$scope.startAMI = function() {
								// show first state message
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
													return AWSService
															.start(res.data.GroupId);
												})
										.then(
												function(res) {

													$scope.instance = res.data.instanceStatus.Instances[0];
													//			
													// // answer about state
													$scope.waitFor();
											}).catch(function(err){
													console.log(err);
													 $scope.message.desc = err.data;
													 $scope.message.type = 'danger';
													 // TODO:
													 // just for show the
														// error!
													 $scope.instance ={};													
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
						config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
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
