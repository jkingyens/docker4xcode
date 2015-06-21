var should = require('should');
var os = require('os');
var cp = require('child_process');
var rimraf = require('rimraf');
var ncp = require('ncp');
var server = require('../server');
var path = require('path');
var uuid = require('node-uuid');

describe('build', function (cb) { 

	this.timeout(30000);

	it('should build a basic ios sample application', function (cb) { 

		// create the web server
		var test_unit = server.createServer(3000, function () { 

			// create a temporary directory
			var tmpdir = path.normalize(os.tmpdir() + '/' + uuid.v4());

			// copy the sample application into this directory
			ncp.ncp(__dirname + '/../sample', tmpdir, function (err) { 

				if (err) { 
					return cb(err);
				}

				// invoke the docker client with the correct environment variables
				var dockercmd = cp.spawn('/usr/local/bin/docker', ['build', '-t=test_ios_app',  '.'], { 
					cwd: tmpdir,
					env: { 
						'DOCKER_HOST': 'tcp://localhost:3000'
					}
				});

				// pipe the output into a string buffer
				var stream = '';
				dockercmd.stdout.on('data', function (data) { 

					var chunk = data.toString();
					stream += chunk;

				});

				var errStream = '';
				dockercmd.stderr.on('data', function (data) { 

					var chunk = data.toString();
					errStream += chunk;

				});

				// wait for docker client to complete
				dockercmd.on('close', function () { 

					// if there was an error then test failed
					if (errStream.length !== 0) { 
						return cb(new Error(errStream));
					}

					// scan the string buffer for the correct text output
					stream.indexOf('build complete').should.not.equal(-1);

					// shut down the http server
					test_unit.on('close', function () { 
						cb();
					});
					test_unit.close();

				});

			});

		});

	});

});

describe('images', function (cb) { 

	// allow for long builds
	this.timeout(30000);

	it('should list both the build artifact and the ios container image', function (cb) { 

		// create the web server
		var test_unit = server.createServer(3000, function () { 

			// create a temporary directory
			var tmpdir = path.normalize(os.tmpdir() + '/' + uuid.v4());

			// copy the sample application into this directory
			ncp.ncp(__dirname + '/../sample', tmpdir, function (err) { 

				if (err) { 
					return cb(err);
				}

				// invoke the docker client with the correct environment variables
				var dockercmd = cp.spawn('/usr/local/bin/docker', ['build', '-t=test_ios_app',  '.'], { 
					cwd: tmpdir,
					env: { 
						'DOCKER_HOST': 'tcp://localhost:3000'
					}
				});

				// pipe the output into a string buffer
				var stream2 = '';
				dockercmd.stdout.on('data', function (data) { 

					var chunk = data.toString();
					stream2 += chunk;

				});

				var errStream2 = '';
				dockercmd.stderr.on('data', function (data) { 

					var chunk = data.toString();
					errStream2 += chunk;

				});

				// wait for docker client to complete
				dockercmd.on('close', function () { 

					// if there was an error then test failed
					if (errStream2.length !== 0) { 
						return cb(new Error(errStream));
					}

					// scan the string buffer for the correct text output
					stream2.indexOf('build complete').should.not.equal(-1);

					// run 'docker images'
					var dockercmd = cp.spawn('/usr/local/bin/docker', ['images'], { 
						cwd: tmpdir,
						env: { 
							'DOCKER_HOST': 'tcp://localhost:3000'
						}
					});

					// pipe the output into a string buffer
					var stream = '';
					dockercmd.stdout.on('data', function (data) { 

						var chunk = data.toString();
						stream += chunk;

					});

					var errStream = '';
					dockercmd.stderr.on('data', function (data) { 

						var chunk = data.toString();
						errStream += chunk;

					});

					// wait for docker client to complete
					dockercmd.on('close', function () { 

						// if there was an error then test failed
						if (errStream.length !== 0) { 
							return cb(new Error(errStream));
						}

						// should contain an image that represents the build artifcats
						stream.indexOf('test_ios_app').should.not.equal(-1);

						// should contain an image that represents the ios image
						stream.indexOf('test_ios_app-build').should.not.equal(-1);

						// shut down the http server
						test_unit.on('close', function () { 
							cb();
						});
						test_unit.close();

					});

				});

			});

		});

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