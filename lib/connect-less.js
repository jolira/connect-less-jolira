(function () {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        debug = require('./debug'),
        crypto = require('crypto'),
        less = require('less');

    function md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    function locate(file, dirs, cb, idx) {
        var i = idx || 0;

        if (i >= dirs.length) {
            var err = new Error("file " + file + " not found in " + dirs);
            err.code = 404;
            return cb(err);
        }

        var _file = path.join(dirs[i], file);

        return path.exists(_file, function (exists) {
            if (exists) {
                return cb(undefined, _file);
            }

            return locate(file, dirs, cb, i + 1);
        });
    }

    function compile(filename, paths, cb, options) {
        var split = filename.split("/"),
            file = split.pop(),
            dirs = [];

        paths.forEach(function(p) {
            split.forEach(function(segment){
                p = path.join(p, segment);
            });

            dirs.push(p);
        });

        locate(file, dirs, function (err, qfile) {
            if (err) {
                err.file = file;
                return cb(err);
            }

            return fs.readFile(qfile, "UTF-8", function (err, content) {
                if (err) {
                    err.file = qfile;
                    return cb(err);
                }

                var baseDir = path.dirname(qfile),
                    searchPaths = dirs.slice(0);

                searchPaths.push(baseDir);

                var parser = new less.Parser({
                    paths:searchPaths,
                    filename:file
                });

                parser.parse(content, function (e, tree) {
                    return cb(undefined, tree, content);
                });
            });
        });
    }

    function toCSS(tree, cb) {
        try {
            var body = tree.toCSS({ compress:!debug.debug });

            return cb(undefined, body);
        }
        catch (err) {
            return cb(err);
        }
    }

    function sendResponse(res, compiled) {
        res.writeHead(compiled.code, compiled.headers);
        return res.end(compiled.body);
    }

    function resolve(dirs) {
        var result = [];

        dirs.forEach(function(dir){
            var resolved = path.resolve(dir);

            result.push(resolved);
        });

        return result;
    }

    less.Parser.importer = compile;

    module.exports = function (directories, options) {
        if (!directories) {
            throw new Error("no directories defined");
        }

        var dirs = resolve(Array.isArray(directories) ? directories : [ directories ]),
            opts = options || {},
            compiledByFile = {};

        return function (req, res, next) {
            var file = req.url;

            if (!file.match(/\.(less)$/)) {
                return next();
            }

            var compiled = compiledByFile[file];

            if (compiled) {
                return sendResponse(res, compiled);
             }

            compile(file, dirs, function (err, tree, content) {
                return toCSS(tree, function (err, body) {
                    if (err) {
                        debug("exception while compiling", err.file|| file, err.stack || err);

                        var message = err.toString();

                        compiled = {
                            code: err.code || 500,
                            body: message,
                            headers: {
                                'Content-Type':'text/plain',
                                'Content-Length':message.length
                            }
                        };
                    }
                    else {
                        compiled = {
                            code: 200,
                            body: body,
                            headers: {
                                'Content-Type':'text/css',
                                'Content-Length':body.length,
                                'ETag':'"' + md5(body) + '"',
                                'Cache-Control':debug.debug ? 'NO-CACHE' : 'public, max-age=' + (options.maxAge / 1000)
                            }
                        };
                    }
                    if (!debug.debug) {
                        compiledByFile[file] = compiled;
                    }
                    return sendResponse(res, compiled);
                });
            }, opts);
        };
    };
})();
