'use strict';

require('dotenv').config();
var env = process.env;
var s3 = require('./index.js');

var accessKeyId = env.AWS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID;
var secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
var region = env.AWS_REGION;
var bucket = env.AWS_BUCKET;
var prefix = env.AWS_BUCKET_PREFIX;

var key = 'test-file';
var fs = require('fs');

async function run() {
    // UPLOAD
    //var testFile = __filename;
    var testFile = 'test.bin';
    var stat = fs.statSync(testFile);
    var size = stat.size;
    var stream = fs.createReadStream(testFile);
    var file = fs.readFileSync(testFile);
    await s3
        .set({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            body: stream,
            size
        })
        .then(function (resp) {
            console.info('PASS: stream uploaded file');
            return null;
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('PUT Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
                console.error(
                    (err.response.body && err.response.body) ||
                        JSON.stringify(err.response.body)
                );
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // CHECK DOES EXIST
    await s3
        .head({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            console.info('PASS: streamed file exists');
            return null;
        })
        .catch(function (err) {
            console.error('HEAD Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

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
            if (file.toString('binary') === resp.body.toString('binary')) {
                console.info(
                    'PASS: streamed file downloaded with same contents'
                );
                return null;
            }
            throw new Error("file contents don't match");
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('GET Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // DELETE TEST FILE
    await s3
        .del({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            console.info('PASS: delete file');
            return null;
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('DELETE Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // SHOULD NOT EXIST
    await s3
        .head({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            var err = new Error('file should not exist');
            err.response = resp;
            throw err;
        })
        .catch(function (err) {
            if (err.response && 404 === err.response.statusCode) {
                console.info('PASS: streamed file deleted');
                return null;
            }
            console.error('Error:');
            console.error('HEAD Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // CREATE WITHOUT STREAM
    await s3
        .set({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            body: file
        })
        .then(function (resp) {
            console.info('PASS: one-shot upload');
            return null;
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('PUT Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
                console.error(
                    (err.response.body && err.response.body) ||
                        JSON.stringify(err.response.body)
                );
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // CHECK DOES EXIST
    await s3
        .head({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            console.info('PASS: one-shot upload exists');
            return null;
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('HEAD Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // GET ONE-SHOT FILE
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
            if (file.toString('binary') === resp.body.toString('binary')) {
                console.info(
                    'PASS: one-shot file downloaded with same contents'
                );
                return null;
            }
            throw new Error("file contents don't match");
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('GET Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // DELETE FILE
    await s3
        .del({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            console.info('PASS: DELETE');
            return null;
        })
        .catch(function (err) {
            console.error('Error:');
            console.error('DELETE Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

    // SHOULD NOT EXIST
    await s3
        .head({
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key
        })
        .then(function (resp) {
            var err = new Error('file should not exist');
            err.response = resp;
            throw err;
        })
        .catch(function (err) {
            if (err.response && 404 === err.response.statusCode) {
                console.info('PASS: streamed file deleted');
                return null;
            }
            console.error('Error:');
            console.error('HEAD Response:');
            if (err.response) {
                console.error(err.response.statusCode);
                console.error(err.response.headers);
            } else {
                console.error(err);
            }
            process.exit(1);
        });
}

run();
