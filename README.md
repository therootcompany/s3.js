# [s3.js](https://git.rootprojects.org/root/s3.js) | a [Root](https://rootprojects.org) project

> Minimalist S3 client

A lightweight alternative to the s3 SDK that uses only @root/request and aws4.

-   set()
-   get()
-   head()
-   delete()
-   sign()

Download a file from S3

```js
s3.get({
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
    prefix,
    key
});
```

Upload a new file to S3

```js
s3.set({
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
    prefix,
    key,
    body,
    size
});
```

Return signed URL without fetching.

```js
s3.sign({
    method: 'get',
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
    prefix,
    key
});
```

If the body is a stream then `size` must be set to `fs.statSync(filePath).size`, or the request will fail:

```
501
<Code>NotImplemented</Code><Message>A header you provided implies functionality that is not implemented</Message>
```
