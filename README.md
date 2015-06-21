# Docker for iOS Development
Build and ship iOS apps with standard docker client. Just drop a Dockerfile into an XCode project and build+distribute using docker containers.

# Getting Started

## Requirements

  * OSX (tested with 10.10.3)
  * XCode (tested with 6.3.2)
  * Node.js (tested with 0.10.32)
  * ios-sim (npm install -g ios-sim)

Then drop a Dockerfile into your iOS app directory:

## Example Dockerfile
```
FROM Xcode:7.0
WORKDIR /
COPY . /
RUN xcodebuild
HYDRATE /build/Debug-iphonesimulator/SampleApp.app
```
The HYDRATE command instructs the docker builder to transform raw bits
into a _new_ docker image as an artifact. The architecture is assumed to be iphonesimulator plaform right now. Hence, docker build will output two images:

```
REPOSITORY          TAG                 IMAGE ID            CREATED                  VIRTUAL SIZE
test-build          latest              9240d3d01481        Less than a second ago   8.884 MB
test                latest              dd5a93fcf2ad        Less than a second ago   8.215 MB
```

`test-build` contains the full build directory from the OSX platform.
`test` contains just the ios container (app). 
you can then `docker run` the `test` image to invoke th simulator

# Usage

## Start up the Daemon
```
npm install
npm start
export DOCKER_HOST=tcp://localhost:3000
```

## build & run your apps from CLI:
```
docker build -t=test .
docker run test
```

# Development

## Running Tests

```
npm install 
npm test
```

## Running Sample Project
```
cd sample
docker build -t=sample-ios-app .
<buid output....>
docker images
<image list>
docker run <image_name>
```

# Roadmap
  * Complete the REST API 
  * Registery/store implementations
  * docker-compose and docker-machine support
  * Android development