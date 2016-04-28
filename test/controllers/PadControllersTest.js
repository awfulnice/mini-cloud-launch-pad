describe('PadControllers test', function() {
	beforeEach(module('launchPadApp'));

	describe('Pad AWS controller test', function() {
		var ctrl, $controller, $httpBackend, deferred;

		var $scope, AWSService, $http, $window, $q;

		// http://www.bradoncode.com/blog/2015/07/13/unit-test-promises-angualrjs-q/
		beforeEach(inject(function(_$httpBackend_, _$q_, $rootScope,
				_$controller_, AWSService, _$window_) {

			// The injector unwraps the underscores (_) from
			// around the
			// parameter names when matching
			$httpBackend = _$httpBackend_;
			// $q = _$q_;
			$scope = $rootScope.$new();
			$controller = _$controller_;
			$window = _$window_;

			// init the Controller
			ctrl = $controller('PadCtrl', {

				$scope : $scope,
				AWSService : AWSService,
				$http : $httpBackend,
				$window : $window
			// $q : $q
			});

		}));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();

		});
		
		var instanceRunningData = {
				status : {
					Reservations : [ {
						Instances : [ {
							PublicDnsName : "Public DNS"
						} ]
					} ]
				}
			};


		describe('when startAMI method is called', function() {
			it('service should start AMI', function() {
				// returned data
				var data = {
					GroupId : 1
				};
				var startData = {
					instanceStatus : {
						Instances : [ {
							InstanceId : 1
						} ]
					}
				};

				
				// service calls to server
				$httpBackend.expectGET('/api/openHTTPPort').respond(data, 200);
				$httpBackend.expectGET('/api/startAMI?groupId=1').respond(
						startData, 200);
				$httpBackend.expectGET(
						'/api/waitFor?status=instanceRunning&instanceId=1')
						.respond(instanceRunningData, 200);

				$httpBackend.expectGET(
						'/api/waitFor?status=instanceStatusOk&instanceId=1')
						.respond(instanceRunningData, 200);

				$scope.startAMI();
				$httpBackend.flush();

				expect($scope.instance).not.toBe(undefined);
				expect($scope.publicDnsName).not.toBe(undefined);
				expect($scope.message.desc).toBe('Instance Reachable!');
			});
		});

		// TODO: test return promises

		describe('stop ', function() {
			describe('when stop method is called', function() {
				it('message should  be OK', function() {
					
					$scope.instance = 1;
					$httpBackend.expectGET('/api/stopAMI?instanceId=xxx')
							.respond({
								instanceId : 'xxx',
								status : 'Terminated'
							}, 200);
					$httpBackend.expectGET(
					'/api/waitFor?status=instanceTerminated&instanceId=xxx')
					.respond(instanceRunningData, 200);
					
					$scope.stop('xxx');
					$httpBackend.flush();

					expect($scope.message.desc).toBe('Instance Terminated!');
				});

			});
			describe('when stop method returns error', function() {
				it('message should be KO', function() {
					$scope.instance = 1;
					$httpBackend.expectGET('/api/stopAMI?instanceId=1').respond(200);
					
					$httpBackend.expectGET('/api/waitFor?status=instanceTerminated&instanceId=1').respond(500, '');
					
					$scope.stop('1');
					$httpBackend.flush();

					expect($scope.message.desc).toBe('Unexpected error!');
				});
				it('message should be KO too', function() {
					$scope.instance = 1;
					$httpBackend.expectGET('/api/stopAMI?instanceId=1').respond(500);
					
					$scope.stop('1');
					$httpBackend.flush();

					expect($scope.message.desc).toBe('Unexpected error!');
				});

			});
		});
		describe('waitFor', function() {
			it('message should be KO', function() {

				$httpBackend.expectGET('/api/waitFor?status=instanceRunning&instanceId=1').respond(-1);

				$scope.instance = {InstanceId : 1};
				$scope.waitFor();
				$httpBackend.flush();

				expect($scope.message.desc).toBe('Unexpected error!');

			});
		});
		

	});
});