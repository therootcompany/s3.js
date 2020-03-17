'use strict';

var aws4 = require('aws4');
var request = require('@root/request');
var env = process.env;

module.exports = {
    // HEAD
    head: function({
        host,
        accessKeyId,
        secretAccessKey,
        region,
        bucket,
        prefix,
        key
    }) {
        // TODO support minio
        /*
        var awsHost = config.awsHost;
        if (!awsHost) {
            if (awsRegion) {
                awsHost = awsHost || 's3.'+awsRegion+'.amazonaws.com';
            } else {
                // default
                awsHost = 's3.amazonaws.com';
            }
        }
        */
        /*
        if (env.AWS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID) {
            accessKeyId = accessKeyId || env.AWS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID;
            secretAccessKey = secretAccessKey || env.AWS_SECRET_ACCESS_KEY;
            bucket = bucket || env.AWS_BUCKET;
            prefix = prefix || env.AWS_BUCKET_PREFIX;
            region = region || env.AWS_REGION;
            endpoint = endpoint || env.AWS_ENDPOINT;
        }
        */
        prefix = prefix || '';
        if (prefix) {
            // whatever => whatever/
            // whatever/ => whatever/
            prefix = prefix.replace(/\/?$/, '/');
        }
        var signed = aws4.sign(
            {
                host: host || bucket + '.s3.amazonaws.com',
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'HEAD',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;

        return request({ method: 'HEAD', url }).then(function(resp) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                'expected status 200 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // GET
    get: function({
        host,
        accessKeyId,
        secretAccessKey,
        region,
        bucket,
        prefix,
        key,
        json
    }) {
        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }
        var signed = aws4.sign(
            {
                host: host || bucket + '.s3.amazonaws.com',
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'GET',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;

        // stay binary by default
        var encoding = null;
        if (json) {
            encoding = undefined;
        }
        return request({
            method: 'GET',
            url,
            encoding: encoding,
            json: json
        }).then(function(resp) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                'expected status 200 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // PUT
    set: function({
        host,
        accessKeyId,
        secretAccessKey,
        region,
        bucket,
        prefix,
        key,
        body,
        size
    }) {
        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }
        var signed = aws4.sign(
            {
                host: host || bucket + '.s3.amazonaws.com',
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'PUT',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;
        var headers = {};
        if ('undefined' !== typeof size) {
            headers['Content-Length'] = size;
        }

        return request({ method: 'PUT', url, body, headers }).then(function(
            resp
        ) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                'expected status 201 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // DELETE
    del: function({
        host,
        accessKeyId,
        secretAccessKey,
        region,
        bucket,
        prefix,
        key
    }) {
        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }
        var signed = aws4.sign(
            {
                host: host || bucket + '.s3.amazonaws.com',
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'DELETE',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;

        return request({ method: 'DELETE', url }).then(function(resp) {
            if (204 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                'expected status 204 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    }
};
