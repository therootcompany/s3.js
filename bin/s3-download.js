#!/usr/bin/env node

'use strict';

require('dotenv').config();
var env = process.env;
var s3 = require('../index.js');

var accessKeyId = env.AWS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID;
var secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
var region = env.AWS_REGION;
var bucket = env.AWS_BUCKET;
var prefix = env.AWS_BUCKET_PREFIX;

var key = process.argv[2];
var filepath = process.argv[3];
var fs = require('fs');

if (!key || !filepath) {
    console.info('Usage: s3-download.js s3-key-name ./path/to/file.bin');
    process.exit(1);
}

async function run() {
    // GET STREAMED FILE
    await s3
        .get({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            console.log(resp.url);
            return fs.promises.writeFile(filepath, resp.body);
        })
        .catch(function (err) {
            console.error('Error:');
            if (err.response) {
                console.error(err.url);
                console.error('GET Response:');
                console.error(err.response.statusCode);
                console.error(err.response.headers);
                console.error(err.response.body.toString('utf8'));
            } else {
                console.error(err);
            }
            process.exit(1);
        });
}

run();
