'use strict';

/* Controllers */

var padServices = angular.module('padServices', []);

padServices
		.factory(
				'AWSService',
				function($http) {

					return {
						get : function() {
							// this returns something
							console.log("test service");
						},
						start : function(GroupId) {
							return $http({
								url : '/api/startAMI?groupId=' + GroupId,
								method : 'GET'
							})
						},

						waitFor : function(instanceStatus, instanceId) {

							return $http({
								url : '/api/waitFor?status=' + instanceStatus
										+ '&instanceId=' + instanceId,
								method : 'GET'
							})
						},

						stop : function() {
							return $http({
								url : '/api/stopAMI',
								method : 'GET'
							})
							// .success(function(data, status, headers, config)
							// {
							// console.log(data);
							// // $scope.message = 'AMI stopped!'; // Should
							// // log 'foo'
							// }).error(function(data, status, headers, config)
							// {
							// alert(data);
							// });
						},

						openHTTPPort : function() {
							return $http({
								url : '/api/openHTTPPort',
								method : 'GET'
							})
							// .success(function(data, status, headers, config)
							// {
							//								
							// return data;
							// // $scope.message = 'openHTTPPort!'; // Should
							// // log
							//								
							// }).error(function(data, status, headers, config)
							// {
							// console.log(data);
							// });
						},
						describeInstance : function() {
							console.log('describe instance service');
							return $http({
								url : '/api/describeInstance',
								method : 'GET'
							})
									.success(
											function(data, status, headers,
													config) {
												for ( var state in data.reservations.Reservations) {
													console
															.log(data.reservations.Reservations[state].Instances[0].State.Name);
												}
												return data.reservations.Reservations[0].Instances[0].State.Name; // Should
												// log
												// 'foo'
											}).error(
											function(data, status, headers,
													config) {
												alert(data);
											});
						}

					};

				});