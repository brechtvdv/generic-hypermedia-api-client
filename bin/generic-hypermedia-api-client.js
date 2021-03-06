"use strict";
exports.__esModule = true;
var MetadataHandler_1 = require("../lib/MetadataHandler");
var ApiClient_1 = require("../lib/ApiClient");
var PaginationHandler_1 = require("../lib/PaginationHandler");
var LanguageHandler_1 = require("../lib/LanguageHandler");
var VersioningHandler_1 = require("../lib/VersioningHandler");
var FullTextSearchHandler_1 = require("../lib/FullTextSearchHandler");
var CRUDHandler_1 = require("../lib/CRUDHandler");
var minimist = require('minimist');
process.argv.splice(0, 2);
var args = minimist(process.argv);
var handlers = [];
if (args._.length < 2 || args._.length > 7 || args.h || args.help) {
    // Print command usage
    process.stderr.write("\n    generic-hypermedia-api-client requires an URL and one or more handlers\n    \n    Usage:    \n    generic-hypermedia-api-client http://example.org handler1 handler2\n    \n    Handlers:\n        * metadata\n        * pagination\n        * language\n        * versioning\n        * full_text_search\n        * crud\n    \n    Options:\n        -l                      [LanguageHandler]: expects value of the 'Accept-Language' header\n        -v                      [FullTextSearchHandler]: value(s) to be filled in as value(s) in the template URL. Multiple values between \"\" and separated by a space\n        -k                      [FullTextSearchHandler]: key(s) to be filled in as key(s) in the template URL. Multiple keys between \"\" and separated by a space\n        --followdoclink         [MetadataHandler]: follow the documentation link if found\n        --queryurl              [FullTextSearchHandler]: query the template URL with the query values (and keys)\n        --followversionlink     [VersionHandler]: follow the versioned URL\n        --help                  print this help message\n    ");
    process.exit(1);
}
function createHandlers(client) {
    var handlers = [];
    try {
        for (var i = 1; i < args._.length; i++) {
            switch (args._[i]) {
                case 'metadata':
                    var followDocLink = false;
                    if (args.followdoclink) {
                        followDocLink = true;
                    }
                    handlers.push(new MetadataHandler_1.MetadataHandler({
                        metadataCallback: function (metadata) { return console.log(metadata); },
                        apiClient: client,
                        followDocumentationLink: followDocLink
                    }));
                    break;
                case 'pagination':
                    handlers.push(new PaginationHandler_1.PaginationHandler({
                        pagedataCallback: function (pagedata) { return console.log(pagedata); },
                        subjectStream: client.subjectStream
                    }));
                    break;
                case 'language':
                    var languageHeader = 'nl';
                    if (args.l) {
                        languageHeader = args.l;
                    }
                    handlers.push(new LanguageHandler_1.LanguageHandler({
                        languageCallback: function (languagedata) {
                            languagedata.stream.on('data', function (data) {
                                console.log(data);
                            });
                        },
                        acceptLanguageHeader: languageHeader
                    }));
                    break;
                case 'versioning':
                    var followVersionLink = false;
                    if (args.followversionlink) {
                        followVersionLink = true;
                    }
                    handlers.push(new VersioningHandler_1.VersioningHandler({
                        versionCallback: function (versiondata) {
                            versiondata.stream.on('data', function (data) {
                                console.log(data);
                            });
                        },
                        apiClient: client,
                        datetime: new Date(),
                        followLink: followVersionLink
                    }));
                    break;
                case 'full_text_search':
                    var fetch_1 = false;
                    var values = [];
                    var keys = [];
                    if (args.queryurl) {
                        fetch_1 = true;
                    }
                    if (args.v) {
                        values = args.v.split(' ');
                    }
                    if (args.k) {
                        keys = args.keys.split(' ');
                    }
                    handlers.push(new FullTextSearchHandler_1.FullTextSearchHandler({
                        callback: function (ftsdata) {
                            ftsdata.stream.on('data', function (data) {
                                console.log(data);
                            });
                        },
                        apiClient: client,
                        fetchQueryURL: fetch_1,
                        queryValues: values,
                        queryKeys: keys
                    }));
                    break;
                case 'crud':
                    handlers.push(new CRUDHandler_1.CRUDHandler({
                        crudCallback: function (cruddata) {
                            console.log(cruddata);
                        }
                    }));
            }
        }
    }
    catch (error) {
        process.stderr.write(error.message + '\n');
        process.exit(1);
    }
    return handlers;
}
function processURL() {
    var URL = args._[0];
    var client = new ApiClient_1.ApiClient(null);
    try {
        var handlers_1 = createHandlers(client);
        client.fetch(URL, handlers_1);
    }
    catch (error) {
        process.stderr.write(error.message + '\n');
        process.exit(1);
    }
}
processURL();
