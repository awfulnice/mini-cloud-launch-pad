'use strict';

/* Controllers */

var padApp = angular.module('padApp', []);
// inline anotation for prevent minifier issues
// https://scotch.io/tutorials/declaring-angularjs-modules-for-minification

padApp.controller('PadCtrl', function($scope, AWSService, $http, $window, $q) {
	$scope.isAuthenticated = false;

	$scope.user = {
		email : 'awfulnice@gmail.com',
		accessKeyId : '',
		secretAccessKey : ''
	};

	$scope.submit = function() {

		$http.post('/authenticate', $scope.user)
				.success(
						function(data, status, headers, config) {
							$window.sessionStorage.token = data.token;
							$scope.isAuthenticated = true;
							var encodedProfile = data.token.split('.')[1];
							var profile = JSON
									.parse(url_base64_decode(encodedProfile));

							console.log(profile);
							console.log(data.token);
							// TODO: authenticate users
							$scope.isAuthenticated = true;

							$scope.initialice();

						}).error(function(data, status, headers, config) {
					// Erase the token if the user fails to log in
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
			$scope.message = $scope.message + ' ' + data.name; // Should log
			// 'foo'
		}).error(function(data, status, headers, config) {
			alert(data);
		});
	};

	$scope.logout = function() {

		$scope.isAuthenticated = false;
		delete $window.sessionStorage.token;
	};
	$scope.initialice = function() {

		// TODO: init Bitnami secutity group if the is no group

		// TODO: start image
		var resultStart = AWSService.start();
		// TODO:open port 80
		var openHTTPPort = AWSService.openHTTPPort();

		var promise = $q.all({
			promiseResultStart : resultStart,
			promiseOpenHTTPPort : openHTTPPort,
		});

		promise.then(function(result) {
			console.log(result.promiseResultStart.data);

			// TODO: when is service.start is called, monitor the state of the
			// AMI.
			// Display to the user secuencially, showing a spinner meanwhile
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