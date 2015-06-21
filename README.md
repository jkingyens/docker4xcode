# Docker for iOS Development
Build and ship iOS apps with standard docker client. Just drop a Dockerfile into an XCode project and build+distribute using docker containers.

## Example Dockerfile
```
FROM Xcode:7.0
WORKDIR /
COPY . /
RUN xcodebuild
HYDRATE /build/Debug-iphonesimulator/SampleApp.app
```
The HYDRATE command instructs the docker builder to transform raw bits
into a _new_ docker image as an artifact. The architecture is assumed to be iphonesimulator plaform right now.

# Getting Started

## Requirements

  * OSX (tested with 10.10.3)
  * XCode (tested with 6.3.2)
  * Node.js (tested with 0.10.32)
  * ios-sim (npm install -g ios-sim)

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
docker run <image_name>
```

# Roadmap
  * App stores = registries
  * Android build + ship