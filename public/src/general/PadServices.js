/* Services */

var padServices = angular.module('padServices', []);

// Interface with AWS
padServices
		.factory(
				'AWSService',
				[
						'$http',
						function($http) {
							'use strict';
							return {

								start : function(GroupId) {
									return $http({
										url : '/api/startAMI?groupId=' + GroupId,
										method : 'GET'
									});
								},

								// test instance status every 15 secs
								waitFor : function(instanceStatus, instanceId) {

									return $http({
										url : '/api/waitFor?status=' + instanceStatus
												+ '&instanceId=' + instanceId,// jshint ignore:line
										method : 'GET'
									});
								},

								// stops all AMIs
								stop : function() {
									return $http({
										url : '/api/stopAMI',
										method : 'GET'
									});
								},

								// makes the instance reachable
								openHTTPPort : function() {
									return $http({
										url : '/api/openHTTPPort',
										method : 'GET'
									});
								},

								// describe all instances
								describeInstance : function() {
									console.log('describe instance service');
									return $http({
										url : '/api/describeInstance',
										method : 'GET'
									})
											.success(
													function(data, status,
															headers, config) {
														for ( var state in data.reservations.Reservations) {
															console
																	.log(data.reservations.Reservations[state].Instances[0].State.Name);
														}
														return data.reservations.Reservations[0].Instances[0].State.Name;
													}).error(
													function(data, status,
															headers, config) {
														alert(data);
													});
								}

							};

						} ]);