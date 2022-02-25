"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

// get args passed to script
const args = process.argv.slice(2);
if (args.length == 0) {
  error("Please pass arguments");
  process.exit(1);
}

var uri;

// To simplify reading test data Testkube also stores test content (file,uri,git,whatever)
// Testkube will store it's files and directories in directory defined by `RUNNER_DATADIR` env 
// And will save `test-content` file for:
// - string content (e.g. postman collection is passed as string content read from json file)
// - uri (testkube will get content of file defined by uri)
// In case of git related content: 
// - testkube will checkout repo content in that directory
if (!process.env.RUNNER_DATADIR) {
  error("No valid data directory detected");
  process.exit(1);
}

const testContentPath = path.join(process.env.RUNNER_DATADIR, "test-content");
// let's read test content (URI in our example) from file
uri = fs.readFileSync(testContentPath, { encoding: "utf8", flag: "r"});

// execution is passed as first argument to binary and it contains information
// about what to run in context of your executor (executor is choosen by type in CRD)
// there is also testkubes execution ID passed if you would need to use it.
// for node js it'll be like:
// node app.js '{"id":"ID", "content": {"data": "https://httpstat.us/200"}}'
// threre can be a lot more info like git details etc, follow OpenAPI spec for details
// in recent testkube there is no need to save test content manually - it's already ready to use 
// in mounted Kubernetes Volume


// Real executor code - the testing part
// usually here will be integration with some testing framework - We're doing here simple HTTP GET request
// to simplify example
// call HTTP GET to our URI
https
  .get(uri, (res) => {
    if (res.statusCode == 200) {
      successResult("Got valid status code: 200 OK");
    } else {
      errorResult("Got invalid status code");
    }
  })
  .on("error", (err) => {
    error("Error: " + err.message);
  });

// =====================================================================================
// result helper functions
// see at ExecutorOutput OpenAPI spec from https://kubeshop.github.io/testkube/openapi/
// if your language has OpenAPI spec generators - you can generate them easily
// =====================================================================================

// error result - will output to STDOUT JSON with info about failed test
function errorResult(message) {
  console.log(JSON.stringify({
    "type": "result",
    "result": {
      "status": "error",
      "errorMessage": message,
    },
  }));
}

// successResult - will output to STDOUT JSON with info about sucessful test
function successResult(output) {
  console.log(JSON.stringify({
    "type": "result",
    "result": {
      "status": "success",
      "output": output,
    },
  }));
}

// error will return error info not related to test itself (some issues with executor)
function error(message) {
  console.log(JSON.stringify({
    "type": "error",
    "content": message,
  }));
}
