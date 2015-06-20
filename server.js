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
    NCPU: 256,
    Memtotal: 2099236864, // total amount of video memory?
    Name: 'docker-xcode',
    Debug: false,
    OperatingSystem: 'OSX',
    MemoryLimit: true,
    SwapLimit: true
  });
});

// list containers
app.get('/v1.18/containers/json', function (req, res) {

  res.json([
    {
      Id: 'abc123',
      Image: 'ubuntu:latest',
      Command: 'echo 1',
      Status: 'Exit 0',
      Ports: 'null',
      SizeRw: 12288,
      SizeRootFs: 0,
      Created: new Date().getTime(),
      Name: '/blahblah'
    },
    {
      Id: '123abc',
      Image: 'ubuntu:latest',
      Command: 'echo 1',
      Status: 'Exit 0',
      Ports: 'null',
      SizeRw: 12288,
      SizeRootFs: 0,
      Created: new Date().getTime(),
      Name: '/blahblahblah'
    }
  ]);

});

// get container details
app.get('/v1.18/containers/:id/json', function (req, res) {

  if (req.params.id == 'ubuntu') {

    return res.json(404, {
      message:' container not found'
    });

  }

  res.json({
    Id: req.params.id,
    Image: 'ubuntu:latest',
    Name: 'blahblah',
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

  // lookup to ensure this image actually exists

  // if the image doesnt exist, then report an error

  // if the image does exist, then store this container with image

  // here we can do other kinds of validation with the launch parameters

  console.log('image', req.body.Image);

  res.json(201, {
    Id: 'abc123',
    Warnings: [

    ]
  });

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

  if (req.body.Detach) {
    console.log('container is detached mode');
  }

  if (req.body.Tty) {
    console.log('allocate a pseudo tty');
  }

  res.json(204, {
    message: 'container started'
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
      var dockercmd = cp.spawn(runcmd, [ ], { 
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
        var iosImagePath = tmpDir + '/' + newImageId;
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

  res.json({
    Created: new Date(),
    Container: 'abc123',
    ContainerConfig: {
      Image: 'ubuntu'
    },
    Id: 'abc123',
    Parent: 'opencl-1.2',
    Cmd: [ '/bin/bash' ],
    Size: 0
  });

});

// list images
app.get('/v1.18/images/json', function (req, res) {

  // read the image data from the filesystem

  var images = { };
  if (fs.existsSync(tmpDir + '/images.json')) { 
    images = JSON.parse(fs.readFileSync(tmpDir + '/images.json'));
  }

  // iterate through objects in the hash
  var keys = Object.keys(images);

  var outputImages = [ ];
  keys.forEach(function (imageId) {  

    // TODO: date not working for some reason
    var blah = new Date(images[imageId].created);
    console.log(blah);

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
