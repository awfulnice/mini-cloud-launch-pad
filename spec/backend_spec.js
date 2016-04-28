////https://www.distelli.com/docs/tutorials/test-your-nodejs-with-jasmine
//var request = require("request");
//var server = require("../server.js")
//var base_url = "http://localhost:8080/"
//
//describe("backend/server.js", function() {
//	describe("AWS", function() {
//
//		var req = {
//			status : 'running',
//			instanceId : 'xxx',
//			user : {
//				accessKeyId : '',
//				secretAccessKey : ''
//			}
//		};
//
//		it("returns Status", function(done) {
//			var AWS = require('mock-aws');
//			var EC2 = require('../ec2Service.js')
//
//			var service = EC2.getEC2(req, AWS);
//
//			AWS.mock('EC2', 'waitFor', [ 'one', 'two', 'three' ]);
//			
////			service.ec2.waitFor({
////				status : true
////			}, function(err, data) {
////				console.log(err); // err should equal "ERROR!"
////				console.log(data); // data should be undefined
////			});
//
//			// request.get(base_url +
//			// 'api/waitFor?instanceId=i-0490aef7b2e466045&status=instanceRunning',
//			// function(error, response, body) {
//			// expect(error).toBe("{status : data}");
//			// server.closeServer();
//			// done();
//			// });
//		});
//	});
//});
