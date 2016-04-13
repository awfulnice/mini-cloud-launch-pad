'use strict';

/* Controllers */

var padServices = angular.module('padServices', []);

padServices.factory('AWSService', function($http) {

	return {
		get : function() {
			// this returns something
			console.log("test service");
		},
		start : function() {
			return $http({
				url : '/api/startAMI',
				method : 'GET'
			}).success(function(data, status, headers, config) {

				console.log(data);
				// console.log('AMI state: ' + State.Name);
				// return 'AMI state: ' + State.Name;
				return data;
				// TODO: control all the instances
				// $scope.message += data.instances[0].InstanceId;
			}).error(function(data, status, headers, config) {
				// error meesage
				console.log(data);
				return data;

				// $scope.message = data.message;
			});
		},

		waitFor : function() {
			return $http({
				url : '/api/waitFor',
				method : 'GET'// ,
			// data: {status}
			}).success(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
				// console.log('AMI state: ' + State.Name);
				// return 'AMI state: ' + State.Name;
				return data;
				// TODO: control all the instances
				// $scope.message += data.instances[0].InstanceId;
			}).error(function(data, status, headers, config) {
				console.log(data);
				// $scope.message = data.message;
			});
		},

		stop : function() {
			return $http({
				url : '/api/stopAMI',
				method : 'GET'
			}).success(function(data, status, headers, config) {
				// $scope.message = 'AMI stopped!'; // Should log 'foo'
			}).error(function(data, status, headers, config) {
				alert(data);
			});
		},

//		openHTTPPort : function() {
//			return $http({
//				url : '/api/openHTTPPort',
//				method : 'GET'
//			}).success(function(data, status, headers, config) {
//				return data;
//				// $scope.message = 'openHTTPPort!'; // Should log 'foo'
//			}).error(function(data, status, headers, config) {
//				alert(data);
//			});
//		},
////		describeInstance : function() {
//			console.log('describe instance service');
//			return $http({
//				url : '/api/describeInstance',
//				method : 'GET'
//			}).success(function(data, status, headers, config) {
//				return 'describeInstance!'; // Should log
//				// 'foo'
//			}).error(function(data, status, headers, config) {
//				alert(data);
//			});
//		}

	};

});