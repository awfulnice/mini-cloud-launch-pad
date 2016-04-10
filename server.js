var express = require('express');
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken'); // https://npmjs.org/package/node-jsonwebtoken
var expressJwt = require('express-jwt'); // https://npmjs.org/package/express-jwt

var secret = 'this is the secret secret secret 12356';

var AWS = require('aws-sdk');

// TODO: any alternative?
function initE2(req) {
	AWS.config.update({
		accessKeyId : req.user.accessKeyId,
		secretAccessKey : req.user.secretAccessKey
	});

	// TODO: region in token
	AWS.config.region = 'eu-west-1';
	return new AWS.EC2();
}

// TODO: AMI params on client
var startParams = {
	ImageId : 'ami-48cc753b', // Bitnami WordPress 4.4.2-2 on Ubuntu 14.04.3
	InstanceType : 't1.micro',
	MinCount : 1,
	MaxCount : 1,
	SecurityGroups : [ 'Bitnami',
	/* more items */
	],
};

//
// https://ec2.amazonaws.com/?Action=AuthorizeSecurityGroupIngress
// &GroupName=websrv
// &IpPermissions.1.IpProtocol=tcp
// &IpPermissions.1.FromPort=80
// &IpPermissions.1.ToPort=80
// &IpPermissions.1.IpRanges.1.CidrIp=192.0.2.0/24
// &IpPermissions.1.IpRanges.2.CidrIp=198.51.100.0/24
// &AUTHPARAMS

var app = express();

// We are going to protect /api routes with JWT
app.use('/api', expressJwt({
	secret : secret
}));

app.use(bodyParser.json());

// set the static files location /public/img will be /img for users
app.use('/', express.static(__dirname + '/public'));

app.use(function(err, req, res, next) {
	if (err.constructor.name === 'UnauthorizedError') {
		res.status(401).send('Unauthorized');
	}
});

app.post('/authenticate', function(req, res) {
	// TODO validate req.body.accessKeyId and req.body.secretAccessKey
	// if is invalid, return 401
	// console.log(req);
	if (req.body.accessKeyId === '' || req.body.secretAccessKey === '') {
		res.status(401).send('Wrong user or password');
		return;
	}
	console.log('authenticating...');

	var profile = {
		accessKeyId : req.body.accessKeyId,
		secretAccessKey : req.body.secretAccessKey,
		email : req.body.email,
		id : 123
	};

	// We are sending the profile inside the token
	var token = jwt.sign(profile, secret, {
		expiresInMinutes : 60 * 5
	});

	// TODO: reuse AWS token?
	res.json({
		token : token
	});
});

var instanceId = '';

// TODO: test
app.get('/api/startAMI', function(req, res) {
	console.log('starting AMI...');
	console.log(req.user.accessKeyId);
	console.log(req.user.secretAccessKey);

	// TODO: test if security group exists and add inbound rules

	// TODO: create Ami with security group


	//initialize AWS with profile from token
	var ec2 = initE2(req);

	// Create the instance
	ec2.runInstances(startParams, function(err, data) {
		if (err) {
			console.log("Could not create instance", err);
			// TODO: change error code
			res.status(err.statusCode).send(err.message);

			return;
		}

		instanceId = data.Instances[0].InstanceId;
		console.log("Created instance", instanceId);

		// Add tags to the instance
		params = {
			Resources : [ instanceId ],
			Tags : [ {
				Key : 'Name',
				Value : 'Bitnami-Wordpress-' + new Date().toString()
			} ]
		};
		ec2.createTags(params, function(err) {
			console.log("Tagging instance", err ? "failure" : "success");
		});

		//
		// PublicDnsName -> (string)
		// The public DNS name assigned to the instance. This name is not
		// available until the instance enters the running state.

		// Even the instance is in running state, connection with public DNS
		// could not be reached in a few moments
		var params = {
		// ... input parameters ...
		};
		// ec2.waitFor('instanceRunning', params, function(err, data) {
		// if (err) console.log(err, err.stack); // an error occurred
		// else console.log("instanceRunning", data); // successful response
		// });
		// ec2.waitFor('systemStatusOk', params, function(err, data) {
		// if (err) console.log(err, err.stack); // an error occurred
		// else console.log("systemStatusOk", data); // successful response
		// });
		ec2.describeInstanceStatus(params, function(err, data) {
			if (err)
				console.log(err, err.stack); // an error occurred
			else
				console.log(data); // successful response
		});

		res.json({
			instances : data.Instances
		});
	});

});

// TODO: test
app.get('/api/describeInstance', function(req, res) {
	console.log(req);
	console.log('start describing AMI...');
	var params = {
	// ... input parameters ...
	};
	
	
	
	// create the AWS.Request object
	var request = new AWS.EC2().describeInstances();

	// create the promise object
	var promise = request.promise();

	// handle promise's fulfilled/rejected states
	promise.then(
	  function(data) {
		  console.log('status', data); // successful response
	  },
	  function(err) {
		  console.log(err, err.stack); // an error occurred
	  }
	);
	
		
//	
//	ec2.describeInstanceStatus(params, function(err, data) {
//		if (err)
//			console.log(err, err.stack); // an error occurred
//		else
//			console.log('status', data); // successful response
//	});
	ec2.describeInstances(function(error, data) {
		if (error) {
			console.log(error); // an error occurred
		} else {
			console.log(data); // request succeeded
		}
	});
});






// TODO:test
app.get('/api/openHTTPPort', function(req, res) {

	var secureGroupParams = {

		GroupName : 'Bitnami',
		// IpProtocol : 'tcp',
		// FromPort : 80,
		// ToPort : 80,
		IpPermissions : [ {
			FromPort : 80,
			IpProtocol : 'tcp',
			IpRanges : [ {
				CidrIp : '0.0.0.0/0'
			},
			/* more items */
			],
			ToPort : 80
		},
		/* more items */
		],

	};

	var params = {
		Description : 'Bitnami', /* required */
		GroupName : 'Bitnami'
	};
	// ec2.createSecurityGroup(params, function(err, data) {
	// if (err) console.log(err, err.stack); // an error occurred
	// else console.log(data); // successful response
	// });
	var ec2 = initE2(req);
	ec2.authorizeSecurityGroupIngress(secureGroupParams, function(err, data) {
		if (err) {
			console.log("already opened");
			// console.log(err, err.stack);
		} // an error occurred}

		else {
			console.log(data);
		} // successful response}

	});
	ec2.describeSecurityGroups({}, function(err, data) {
		if (err) {
			console.log(err, err.stack);
		}// an error occurred
		else {
			console.log(data); // successful response
			console.log(data.SecurityGroups[0].IpPermissions);
		}
		;
		res.json({
			instances : data
		});
	});

});

// TODO:test
app.get('/api/stopAMI', function(req, res) {
	var params = {
	// ... input parameters ...
	};
	console.log("instanceId: ", instanceId);
	ec2.waitFor('instanceStopped', params, function(err, data) {
		if (err)
			console.log(err, err.stack); // an error occurred
		else
			console.log(data); // successful response
	});
	ec2.terminateInstances({
		InstanceIds : [ instanceId ]
	}, function(err, data) {
		if (err) {
			console.log("Could not stop instance", err);
			return;
		}
	});
	console.log('stopped AMI...');

	res.json({
		name : 'stopped'
	});
});

app.get('/api/restricted', function(req, res) {
	console.log(req);
	console.log('user ' + req.user.email + ' is calling /api/restricted');
	res.json({
		name : 'foo'
	});
});

app.listen(8080, function() {
	console.log('listening on http://localhost:8080');
});
