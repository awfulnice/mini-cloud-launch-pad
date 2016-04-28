# mini-cloud-launch-pad
Mini cloud launch pad for AWS

This is just a proof of concept web appplication that allow an IAM user to launch a Bitnami WordPress AMI within his AWS account.
This user must have permision to instantiate this kind of AMI and to create security groups. 

## Getting started
Within a NodeJs enviroment install Grunt's command line interface (CLI) globally.:
```node
npm install -g grunt-cli
```
Then install locally all the node dependences:
```node
npm install
```
Install bower dependences
```node
bower install
```
Start the server:
```node
 grunt
```
Visit the application in your browser at http://localhost:8080

### Other tasks
For launch jasmine test and jhint tasks
```node
 grunt test
```
For launch uglify and css compilation tasks
```node
 grunt ugly
``` 

For launch backend tests
```node
 npm test
```

##Documentation

Once started, the user is invited to complete AWS credentials and press submit.
After the user presses submit, the backend code launch a Bitnami WordPress AMI displaying the different states through which it passes the instance. Once the instance is reachable, it shows a link to access the WordPress application and a button to stop the AMI. Also a logout button is displayed and become enabled when the reach checks are completed.
On stop button the different states of the AMI are shown until it is terminated.  


