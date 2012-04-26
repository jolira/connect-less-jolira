Release Notes [![Build Status](https://secure.travis-ci.org/jolira/release-notes.png?branch=master)](http://travis-ci.org/jolira/release-notes)
========================================================================================================================

Getting Started
------------------------------------------------------------------------------------------------------------------------

Node.js 0.6 or better needs to be installed on your system. If you do not have node installed yet, please go to
http://nodejs.org/, download the package for your operating system, and install it.

Install npm for package management, please go to http://npmjs.org/.

Once node and npm are install, you can install release notes dependencies using `npm install -d`.

To run release-notes execute the following:
`node build-repo​rt.js http://jenkins.jolira.com/ test`

Now that you have tested your setup you can modify `approved.txt` file and point to your Jenkins server.