var should = require('should');
var os = require('os');
var cp = require('child_process');

describe('build', function (cb) { 

	it('should build a basic ios sample application', function (cb) { 

		// create a temporary directory

		// copy the sample application into this directory

		// invoke the docker client with the correct environment variables

		// 'docker build -t=test_ios_app .'

		// pipe the output into a string buffer

		// scan the string buffer for the correct text output

		// should contain an image that represents the build artifcats

		// should contain an image that represents the ios image

		cb();

	});

});

describe('images', function (cb) { 

	it('should list both the build artifact and the ios container image', function (cb) { 

		// run the above test

		// run 'dcoker images'

		// stream the output to a string

		// compare the output string to see whether things 

		cb();

	});

});

describe('run', function (cb) { 

	it('should run an ios docker image in the simulator', function (cb) { 

		// run the first test

		// execute 'docker run <image_name>'

		cb();

	});

});

describe('stop', function (cb) { 

	it('should stop a container from running on the ios simulator', function (cb) { 

		// run the first test

		// execute 'docker rm <image_name>'

		// strema output

		// cant really verify this easily in an automated way !?

		cb();

	});

});


describe('rm', function (cb) { 

	it('should remove the build artifact from the image list', function (cb) { 

		// run the first test

		// execute 'docker rm <build_image_name>'

		// stream output 

		// verify the image is no longer listed

		cb();

	});

	it('should remove the ios app image', function (cb) { 

		// run the first test

		// execute 'docker rm <ios_app_name>'

		// stream output 

		// verify the image is no longer listed

		cb();

	});

});