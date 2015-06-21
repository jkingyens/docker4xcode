var fs = require('fs');
var express = require('express');
var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');
var os = require('os');
var tar = require('tar');
var uuid = require('node-uuid');
var path = require('path');
var cp = require('child_process');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var gfs = require('get-folder-size');

var tmpDir = path.normalize(os.tmpdir() + '/' + uuid.v4());
console.log('xcode docker deamon loaded');
console.log('filesystem path: ', tmpDir);
mkdirp(tmpDir);

var app = express();

app.use(logger('combined'));

app.get('/v1.18/_ping', function (req, res) {

  res.json({
    message: 'pong'
  });

});

app.get('/v1.18/version', function (req, res) { 

  res.json({
    "Version": "1.6.2",
    "Os": "darwin",
    "KernelVersion": "Darwin 14.3.0",
    "GoVersion": "go1.4.1",
    "GitCommit": "a8a31ef",
    "Arch": "amd64",
    "ApiVersion": "1.18"
  });

});

app.get('/v1.18/info', function (req, res) {
  res.json({
    Containers: 1,
    Images: 1,
    Driver: 'xcode',
    DriverStatus: [
      [ "" ]
    ],
    ExecutionDriver: "xcode",
    KernelVersion: "1.2",
    NCPU: 1,
    Memtotal: 2099236864, // total amount of video memory?
    Name: 'docker-xcode',
    Debug: false,
    OperatingSystem: 'darwin',
    MemoryLimit: true,
    SwapLimit: true
  });
});

// list containers
app.get('/v1.18/containers/json', function (req, res) {

  var containers = { };
  if (fs.existsSync(tmpDir + '/containers.json')) { 
    containers = JSON.parse(fs.readFileSync(tmpDir + '/containers.json'));
  }

  var output_containers = [ ];

  // iterate through objects in the hash
  var keys = Object.keys(containers);
  keys.forEach(function (containerId) {  

    output_containers.push({ 
      Id: containerId,
      Image: containers[containerId].Image + ':latest',
      Name: containerId,
      State: {
        Error: "",
        ExitCode: 0,
        FinishedAt: new Date(),
        Paused: false,
        Pid: 0,
        Restarting: false,
        Running: false,
        StartedAt: new Date()
      }
    });

  });

  res.json(output_containers);

});

// get container details
app.get('/v1.18/containers/:id/json', function (req, res) {

  var containers = { };
  if (fs.existsSync(tmpDir + '/containers.json')) { 
    containers = JSON.parse(fs.readFileSync(tmpDir + '/containers.json'));
  }

  // iterate through objects in the hash
  var keys = Object.keys(containers);
  var found = null;
  var foundId = null;
  keys.forEach(function (containerId) {  

    if (containers[containerId]) { 

      found = containers[containerId];
      foundId = containerId;

    }

  });

  if (found) { 

    return res.json({
      Id: foundId,
      Image: found.Image + ':latest',
      Name: foundId,
      State: {
        Error: "",
        ExitCode: 9,
        FinishedAt: new Date().getTime(),
        Paused: false,
        Pid: 0,
        Restarting: false,
        Running: false,
        StartedAt: new Date().getTime()
      }
    });

  } else { 

    res.type('application/json');
    res.status(404);
    res.end();

  }

});

// get container stats
app.get('/v1.18/containers/:id/stats', function (req, res) {

  res.json({
    memory_stats: {

    },
    cpu_stats: {

    }
  });

});

// get container details
app.get('/v1.18/containers/:id/top', function (req, res) {

  res.json({
    Titles: [
      'USER',
      'PID'
    ],
    Processes: [
      [ "root", "20147" ]
    ]
  });

});

// get container logs
app.get('/v1.18/containers/:id/logs', function (req, res) {

  res.set('content-type', 'application/vnd.docker.raw-stream');
  res.set('connection', 'upgrade');
  res.set('upgrade', 'tcp');
  res.status(101);

  // FIXME

  setInterval(function () {

    res.send(JSON.stringify({
      log: 'asdfsdafsd',
      stream: 'stdout',
      container_id: 'abc123',
      time: new Date()
    }));

  }, 1000);

  res.end();

});

// delete a container
app.delete('/v1.18/containers/:id', function (req, res) {

  res.json(204, {
    message: 'container deleted'
  });

});

// create a container
app.post('/v1.18/containers/create', bodyParser.json(), function (req, res) {

  console.log(req.body);
  console.log(req.query);

  // lookup to ensure this image actually exists
  var imageName = req.body.Image;

  // if the image doesnt exist, then report an error
  var images = { };
  if (fs.existsSync(tmpDir + '/images.json')) { 
    images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
  }

  // iterate through objects in the hash
  var keys = Object.keys(images);
  var found = null;
  var foundId = null;
  keys.forEach(function (imageId) {  

    if (images[imageId].repo === imageName) { 

      found = images[imageId];
      foundId = imageId;

    }

  });

  if (found) { 

    var containers = { };
    if (fs.existsSync(tmpDir + '/containers.json')) { 
      containers = JSON.parse(fs.readFileSync(tmpDir + '/containers.json'));
    }

    var containerId = uuid.v4();
    var re = new RegExp('-', 'g');
    containerId = containerId.replace(re, '');

    containers[containerId] =  { 
      Image: imageName
    };

    fs.writeFileSync(tmpDir + '/containers.json', JSON.stringify(containers, null, 4));

    res.json(201, {
      Id: containerId,
      Warnings: [

      ]
    });

  } else { 

    res.type('application/json');
    res.status(404);
    res.end();

  }

});

// wait for container to stop/finish and return
app.post('/v1.18/containers/:id/wait', function (req, res) {

  // lookup the container by its id

  // poll or install handler to learn when execution completes

  res.json({
    StatusCode: 0
  });

});

// start a container
app.post('/v1.18/containers/:id/start', bodyParser.json(), function (req, res) {

  var containers = { };
  if (fs.existsSync(tmpDir + '/containers.json')) { 
    containers = JSON.parse(fs.readFileSync(tmpDir + '/containers.json'));
  }

  if (!containers[req.params.id]) { 

    return res.json(404, { 
      message: 'container not found'
    });

  }

  var imageName = containers[req.params.id].Image;
  var images = { };
  if (fs.existsSync(tmpDir + '/images.json')) { 
    images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
  }

  var keys = Object.keys(images);
  var found = null;
  keys.forEach(function (imageId) { 
    if (images[imageId].repo == imageName) { 
      found = images[imageId].path;
    }
  });

  // invoke the simulator to run this container
  console.log('invoke sim with app from path: ', found);

  var proc4 = cp.spawn('ios-sim', ['launch', found]);
  proc4.on('exit', function () { 

    res.json(204, {
      message: 'container started'
    });

  });

});

// build an image from raw data + dockerfile commands
app.post('/v1.18/images/create', function (req, res) {

  // client should send querystring: ?fromSrc=-

  // we should also apply an entrypoint here

  // stream the contents from a tarball, unpack into directory
  req.pipe(tar.Extract({
    path: tmpDir
  })).on('end', function () {

    // verify the entrypoint exists

    // write the data output

    res.json(201, {
      message: 'image created'
    });

  });

});

// build an image from a build context + Dockerfile
app.post('/v1.18/build', function (req, res) {

  var repo = req.query.t;

  console.log(repo);

  // stream the build context locally
  var buildImageId = uuid.v4();
  var re = new RegExp('-', 'g');
  buildImageId = buildImageId.replace(re, '');
  var imageDir = tmpDir + '/' + buildImageId;

  // parse the image name and the tag name

  // stream the contents from a tarball, unpack into directory
  req.pipe(tar.Extract({
    path: imageDir
  })).on('end', function () {

    // read the dockerfile
    var dockerfile = fs.readFileSync(imageDir + '/Dockerfile');

    var dockerfile_lines = dockerfile.toString().split('\n');

    // verify the base image
    var fromline = dockerfile_lines[0];

    // extract version
    var version = fromline.toString().replace('FROM Xcode:', '');

    // extract the xcode version and run xcodeselect to choose platform
    var xcodeselect = cp.spawn('xcode-select', ['-s', '/Applications/Xcode-' + version + '.app/Contents/Developer' ], { 

    });

    xcodeselect.on('exit', function ()  {

      var runline = dockerfile_lines[3];

      // parse the run cmd
      var runcmd = runline.replace('RUN ', '');

      // execute the RUN command
      var dockercmd = cp.spawn(runcmd, ['-configuration',  'Debug', '-sdk', 'iphonesimulator8.3'], { 
        cwd: imageDir
      });

      res.status(200);
      res.type('application/json');

      // pipe the output into a string buffer
      dockercmd.stdout.on('data', function (data) { 

        var chunk = data.toString();
        res.write(JSON.stringify({ 
          stream: chunk
        }));

      });

      var errStream = '';
      dockercmd.stderr.on('data', function (data) { 

        var chunk = data.toString();
        errStream += chunk;

      });

      // wait for docker client to complete
      dockercmd.on('close', function () { 

        if (errStream.length !== 0) { 

          res.write(JSON.stringify({ 
            error: 'xcode build error', 
            errorDetail: { 
              code: -1,
              message: 'blah blah blah'
            }
          }));

          return res.end();
        }

        // read the hydrate command and convert the iOS app bits
        var hydrateline = dockerfile_lines[4];
        var hydratefile = hydrateline.replace('HYDRATE ', '');
        var imagepath = imageDir + hydratefile;

        // make sure the hydrate file exists, otherwise throw error
        var fileExists = fs.existsSync(imagepath);

        if (!fileExists) { 

          res.write(JSON.stringify({ 
            error: 'file to hydrate does not exist', 
            errorDetail: { 
              code: -1,
              message: 'blah blah blah'
            }
          }));

          return res.end();

        }

        // write the file data to a new image
        var newImageId = uuid.v4();
        var re = new RegExp('-', 'g');
        newImageId = newImageId.replace(re, '');
        var iosImagePath = tmpDir + '/' + newImageId + '.app';
        ncp(imagepath, iosImagePath, function () { 

          var images = { };
          if (fs.existsSync(tmpDir + '/images.json')) { 
            images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
          }

          // other stuff that we can add here?
          var created = new Date();

          gfs(iosImagePath, function (err, iosSize) { 

            gfs(imageDir, function (err, buildSize) { 

              console.log(iosSize);

              console.log(buildSize);

              // image entry for the build workspace
              images[buildImageId] = { 
                created: created,
                path: imageDir,
                repo: repo + '-build', 
                size: buildSize
              };

              // add dictionary entries for these two new images
              images[newImageId] = {  
                created: created,
                path: iosImagePath,
                repo: repo,
                size: iosSize
              };

              // write the image data back out to the filesystem
              fs.writeFileSync(tmpDir + '/images.json', JSON.stringify(images, null, 2), 'utf8');

              res.write(JSON.stringify({
                stream: 'build complete\n'
              }));

              res.end();

            });

          });

        });

      });

    });

  });

});

// inspect an image
app.get('/v1.18/images/:name/json', function (req, res) {

  var images = { };
  if (fs.existsSync(tmpDir + '/images.json')) { 
    images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
  }

  // iterate through objects in the hash
  var keys = Object.keys(images);
  var found = null;
  var foundId = null;
  keys.forEach(function (imageId) {  

    if (images[imageId].repo === req.params.name) { 

      found = images[imageId];
      foundId = imageId;

    }

  });

  if (found) { 

      return res.json({
        Created: found.created,
        Container: 'abc123',
        ContainerConfig: {
          Image: 'ubuntu'
        },
        Id: foundId,
        Parent: 'Xcode',
        Cmd: [ 'xcodebuild' ],
        Size: found.size
      });

  } else { 

    res.type('application/json');
    res.status(404);
    res.end();

  }

});

// list images
app.get('/v1.18/images/json', function (req, res) {

  // read the image data from the filesystem

  var images = { };
  if (fs.existsSync(tmpDir + '/images.json')) { 
    images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
  }

  var outputImages = [ ];

  // iterate through objects in the hash
  var keys = Object.keys(images);
  keys.forEach(function (imageId) {  

    // TODO: date not working for some reason
    var blah = new Date(images[imageId].created);

    // get data from images[imageId] 
    outputImages.push({ 
      RepoTags: [
        images[imageId].repo + ':latest'
      ],
      Id: imageId,
      Created: blah.getTime(),
      Size: images[imageId].size,
      VirtualSize: images[imageId].size
    });

  });

  res.json(outputImages);

});

// delete an image
app.delete('/v1.18/images/:name', function (req, res) {

  res.json([
    { Untagged: 'abc123' },
    { Deleted: 'abc123' }
  ]);

});

module.exports.createServer = function (port, cb) { 

  var server = http.createServer(app);
  server.listen(port, cb);
  return server;

}
