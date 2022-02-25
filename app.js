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
// in directory in `RUNNER_DATADIR` env test contents like file or git based will be passed
// in volume and mounted in for string and uri - file will be saved in data directory (/data by default)
// file name will be `/data/test-content` so we can read it easily 
// for git file and git dir there will be files/dirs checked out in /data dir - you need to handle them
if (process.env.RUNNER_DATADIR) {
  const testContentPath = path.join(process.env.RUNNER_DATADIR, "test-content");
  // let's read test content (URI in our example) from file
  uri = fs.readFileSync(testContentPath, {
    encoding: "utf8",
    flag: "r",
  });
}

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
      successResult("200 OK");
    } else {
      errorResult("Got invalid status code");
    }
  })
  .on("error", (err) => {
    error("Error: " + err.message);
  });

// =====================================================================================
// result data structures
// see at ExecutorOutput OpenAPI spec from https://kubeshop.github.io/testkube/openapi/
// if your language has OpenAPI spec generators - you can generate those easily
// =====================================================================================

// error result - will output to STDOUT JSON with info about failed test
function errorResult(message) {
  console.log({
    "type": "result",
    "result": {
      "status": "error",
      "errorMessage": message,
    },
  });
}

// successResult - will output to STDOUT JSON with info sucessful results
function successResult(output) {
  console.log({
    "type": "result",
    "result": {
      "status": "success",
      "output": output,
    },
  });
}

function error(message) {
  console.log({
    "type": "error",
    "content": message,
  });
}
