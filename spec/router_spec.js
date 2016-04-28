//https://www.distelli.com/docs/tutorials/test-your-nodejs-with-jasmine
var request = require("request");
var server = require("../server.js")
var base_url = "http://localhost:8080/"

describe("middleware/router.js", function() {
	describe("GET /", function() {

		it("returns status code 200", function(done) {
			request.get(base_url, function(error, response, body) {
				expect(response.statusCode).toBe(200);
				server.closeServer();
				done();
			});
		});

//		it("returns Hello World", function(done) {
//			request.get(base_url, function(error, response, body) {
//				expect(body).toBe("Hello World");
//				server.closeServer();
//				done();
//			});
//		});
	});
});
