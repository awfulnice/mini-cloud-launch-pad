function EC2(req, AWS) {
	AWS.config.update({
		accessKeyId : req.user.accessKeyId,
		secretAccessKey : req.user.secretAccessKey
	});

	AWS.config.region = 'eu-west-1';
	
	this.ec2 = new AWS.EC2();
}

function getEC2(req, AWS) {
	return new EC2(req, AWS);
}

module.exports.getEC2 = getEC2;