//https://www.distelli.com/docs/tutorials/test-your-nodejs-with-jasmine
var request = require("request");
var server = require("../server.js")
var base_url = "http://localhost:8080/"

var AWS = require('mock-aws');

describe("middleware/router.js", function() {
	describe("GET /", function() {

		it("returns status code 200", function(done) {
			request.get(base_url, function(error, response, body) {
				expect(response.statusCode).toBe(200);
				server.closeServer();
				done();
			});
		});

		//TODO
//		/authenticate
//		/waitFor
//		/api/openHTTPPort
//		/api/stopAMI
		
		//TODO: 
		//ERR_EMPTY_RESPONSE
		//limit of 20 instance
		
		
//		// TODO:
//		it("/api/startAMI should returns status code 200", function(done) {
//
//		});
//

	});
});
