describe(
		'PadServices test',
		function() {
			beforeEach(module('launchPadApp'));

			describe(
					'Pad AWS service test',
					function() {
						var scope, ctrl, $controller, service, $httpBackend, log;

						beforeEach(inject(function(_$httpBackend_, $rootScope,
								_$controller_, AWSService, $log) {
							// The injector unwraps the underscores (_) from
							// around the
							// parameter names when matching
							$httpBackend = _$httpBackend_;
							$controller = _$controller_;
							scope = $rootScope.$new();
							service = AWSService;
							log = $log;

							// returned data
							
							
							$httpBackend
									.expectGET(
											'/api/startAMI?groupId=groupId')
									.respond({	instanceStatus : data}, 200));

//							$httpBackend
//									.expectGET(
//											'/prisma-endesa-mdm-liquidation-controllers/rest/paraminv/loadAllCombos')
//									.respond( comboData , 200);
							
						
							// Controller
							ctrl = $controller('ObjectionsParamController', {
								$scope : scope,
								loadParamService : service,
								$log : log
							});

							$httpBackend.flush();

						}));

						it('should load combos', function() {
							expect(scope.combos.resolutors.length).toEqual(5);
							expect(scope.combos.tasks.length).toEqual(5);
							expect(scope.combos.areas.length).toEqual(5);
							expect(scope.combos.pointTypes.length).toEqual(5);
						});

						it('should save parameters', function() {

							var detail = {detail: ""};
							
							$httpBackend
							.expectPOST(
								'/prisma-endesa-mdm-liquidation-controllers/rest/paraminv/save')
									.respond( detail, 200);
							
							expect(scope.showSuccessAlert).toEqual(false);
							
							scope.saveForm();

							// TODO:
// expect(scope.showSuccessAlert).toEqual(true);
							
						});

						// TODO: test directiva

						it('should read parameters and paramMap should be assigned correctly',
								function() {
									// var returnData = {};

									// expect response
									expect(scope.status).toEqual(200);

									// test numeric param
									expect(
											scope.paramMap.MAX_NUMBER_RETRIES_TO_PUBLISH)
											.toEqual(3);
									// test boolean (String)
									expect(
											scope.paramMap.KW_DIFFERENT_MEASURE_LIQ_TO_OBJ_TYPE3)
											.toEqual(407);

									// test task boolean (String)
									expect(
											scope.formTasks.preObjectionTasks.length)
											.toEqual(7);

									// test task boolean (String)
									expect(
											scope.formTasks.objectionTasks.length)
											.toEqual(1);

								});
					});
		});