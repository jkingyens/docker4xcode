# dockerthon
Build and ship iOS and Mac native apps with the docker client

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
```

## Running Sample Project
```
cd sample
DOCKER_HOST=tcp://localhost:3000 docker build -t=sample-ios-app .
<buid output....
DOCKER_HOST=tcp://localhost:3000 docker images
<lists build artifact + ios app container>
```
