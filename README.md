Yet Another connect-less [![Build Status](https://secure.travis-ci.org/jolira/connect-less-jolira.png?branch=master)](http://travis-ci.org/jolira/connect-less-jolira)
========================================================================================================================

The other existing [less](lesscss.org) handlers for connect.js did not quite work for the
[site-manager](https://github.com/jolira/site-manager). We needed a bit more flexibility than
the other implementations had.

This version supports passing multiple directories, which are all searched for less files. The
less files are compiled when requested the first time, unless debugging is enabled.

## Installation

```
npm install connect-less-jolira
```


## Example

Search for .less files in ``/var/www`` and ``/home/fido/www``:

```
var connect = require("connect"),
    less = require("connect-less-jolira"),
    app = connect.createServer();
app.use(less(["/var/www", "/home/fido/www"]));
```

Any file with extenstion ``.less`` will be compiled on-demand and returned as ``text/css`.


## Logs

Logs can be turned on using:

```
export NODE_DEBUG="connect-less"
```
