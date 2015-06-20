# Docker for Mobile Dev (DoMo?)
Build and ship iOS apps with the docker client. Just drop a Dockerfile into an XCode project and build+distribute using docker containers.

## Example Dockerfile
```
FROM Xcode:6.3.2
WORKDIR /
COPY . /
RUN xcodebuild
HYDRATE /build/Release-iphoneos/SampleApp.app
```
The HYDRATE command instructs the docker build process to transform raw bits
into a docker image for future runs. The architecture is assumed to be arm[64] iOS plaform right now, but this could be detected and/or set in the future.

# Getting Started

## Requirements

  * OSX (tested with 10.10.3)
  * XCode (tested with 6.3.2)
  * Node.js (tested with 0.10.32)

## Running Tests

```
npm install 
npm test
```

## Running Daemon
```
npm install
npm start
export DOCKER_HOST=tcp://localhost:3000
```

## Running Sample Project
```
cd sample
docker build -t=sample-ios-app .
<buid output....>
docker images
<image list>
```

# Roadmap

  * Android Development