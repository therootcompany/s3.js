'use strict';

var aws4 = require('aws4');
var request = require('@root/request');

var S3;

function assertCredentials(accessKeyId, secretAccessKey) {
    // https://docs.aws.amazon.com/IAM/latest/APIReference/API_AccessKey.html
    // https://awsteele.com/blog/2020/09/26/aws-access-key-format.html
    if ('A' !== String(accessKeyId)[0] || String(accessKeyId).length < 16) {
        throw new Error(
            `[s3.js] invalid or missing accessKeyId=AWS_ACCESS_KEY_ID: ${accessKeyId}`
        );
    }
    if ('string' !== typeof secretAccessKey || secretAccessKey.length < 16) {
        throw new Error(
            `[s3.js] invalid or missing secretAccessKey=AWS_SECRET_ACCESS_KEY: ${secretAccessKey}`
        );
    }
}

function toAwsBucketHost(host, bucket, region) {
    if (host) {
        return [host];
    }

    // Handle simply if it contains only valid subdomain characters
    // (most notably that it does not have a '.' or '_')
    if (/^[a-z0-9-]+$/i.test(bucket)) {
        return ['', bucket + '.s3.amazonaws.com'];
    }

    // Otherwise use region-specific handling rules
    // (TODO: handle other regional exceptions)
    // http://www.wryway.com/blog/aws-s3-url-styles/
    if (!region || 'us-east-1' === region) {
        return ['s3.amazonaws.com'];
    }
    return ['s3-' + region + '.amazonaws.com'];
}

module.exports = S3 = {
    // HEAD
    head: function (
        {
            host,
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            ...requestOpts
        },
        _sign
    ) {
        assertCredentials(accessKeyId, secretAccessKey);

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

        var [host, defaultHost] = toAwsBucketHost(host, bucket, region);
        var signed = aws4.sign(
            {
                host: host || defaultHost,
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'HEAD',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;
        if ('sign' === _sign) {
            return url;
        }

        return request(
            Object.assign(requestOpts, { method: 'HEAD', url })
        ).then(function (resp) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                '[s3.js] expected status 200 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // GET
    get: function (
        {
            host,
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            json,
            ...requestOpts
        },
        _sign
    ) {
        assertCredentials(accessKeyId, secretAccessKey);

        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }

        var [host, defaultHost] = toAwsBucketHost(host, bucket, region);
        var signed = aws4.sign(
            {
                host: host || defaultHost,
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'GET',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;
        if ('sign' === _sign) {
            return url;
        }

        // stay binary by default
        var encoding = null;
        if (json) {
            encoding = undefined;
        }
        return request(
            Object.assign(requestOpts, {
                method: 'GET',
                url,
                encoding: encoding,
                json: json
            })
        ).then(function (resp) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                '[s3.js] expected status 200 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // PUT
    set: function (
        {
            host,
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            body,
            size,
            ...requestOpts
        },
        _sign
    ) {
        assertCredentials(accessKeyId, secretAccessKey);

        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }

        var [host, defaultHost] = toAwsBucketHost(host, bucket, region);
        var signed = aws4.sign(
            {
                host: host || defaultHost,
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

        return request(
            Object.assign(requestOpts, { method: 'PUT', url, body, headers })
        ).then(function (resp) {
            if (200 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                '[s3.js] expected status 201 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // DELETE
    delete: function (
        {
            host,
            accessKeyId,
            secretAccessKey,
            region,
            bucket,
            prefix,
            key,
            ...requestOpts
        },
        _sign
    ) {
        assertCredentials(accessKeyId, secretAccessKey);

        prefix = prefix || '';
        if (prefix) {
            prefix = prefix.replace(/\/?$/, '/');
        }

        var [host, defaultHost] = toAwsBucketHost(host, bucket, region);
        var signed = aws4.sign(
            {
                host: host || defaultHost,
                service: 's3',
                region: region,
                path: (host ? '/' + bucket : '') + '/' + prefix + key,
                method: 'DELETE',
                signQuery: true
            },
            { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey }
        );
        var url = 'https://' + signed.host + signed.path;

        return request(
            Object.assign(requestOpts, { method: 'DELETE', url })
        ).then(function (resp) {
            if (204 === resp.statusCode) {
                resp.url = url;
                return resp;
            }
            var err = new Error(
                '[s3.js] expected status 204 but got ' +
                    resp.statusCode +
                    '. See err.response for more info.'
            );
            err.url = url;
            err.response = resp;
            throw err;
        });
    },

    // sign-only
    sign: function (opts) {
        var method = opts.method;
        if (!method) {
            method = 'GET';
        }
        switch (method.toUpperCase()) {
            case 'HEAD':
                return S3.head(opts, 'sign');
            case 'GET':
                return S3.get(opts, 'sign');
            case 'POST':
            case 'PUT':
            case 'SET':
                return S3.set(opts, 'sign');
            case 'DEL':
            case 'DELETE':
                return S3.del(opts, 'sign');
            default:
                throw new Error(`[s3.js] Unknown method '${method}'`);
        }
    }
};
S3.del = S3.delete;
