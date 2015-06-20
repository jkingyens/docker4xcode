# User Story

  * add a Dockerfile to the root of your XCode Project
  * run 'docker build' from the project root and xcode build process is invoked
  * user can see build log stream similar to linux image builds today
  * image is created and stored in the server
  * "docker run" invokes the "container" in the simulator
  * "docker push" will send the app container to testflight/itunes connect
  * capture push status values/messages and show them in the docker client output

# Resources

[XCode Continuous integration talk at WWDC](https://developer.apple.com/videos/wwdc/2015/?id=410)

[XCode Continuous integration slides](http://devstreaming.apple.com/videos/wwdc/2015/41097fby32x3opk/410/410_continuous_integration_and_code_coverage_in_xcode.pdf?dl=1)

[XCode Server Experiments/Recipes](https://github.com/tibo/XcodeServer) 

[XCode Server under the hood](http://swiftkey.com/en/tech-blog/under-the-hood-of-xcode-server/)

[XCode Server with bots & TestFlight](http://matt.vlasach.com/xcode-bots-hosted-git-repositories-and-automated-testflight-builds/)

[XCode continuous integration documentation/guide](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/xcode_guide-continuous_integration/)

[Example of using XCode Server APIs written in Swift](https://github.com/czechboy0/XcodeServerSDK)
