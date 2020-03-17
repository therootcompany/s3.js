# [s3.js](https://git.rootprojects.org/root/s3.js) | a [Root](https://rootprojects.org) project

> Minimalist S3 client

A lightweight alternative to the s3 SDK that uses @root/request and aws4.

* set()
* get()
* head()
* delete()

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
})
```

If the body is a stream then `size` must be set to `fs.statSync(filePath).size`, or the request will fail:

```
501
<Code>NotImplemented</Code><Message>A header you provided implies functionality that is not implemented</Message>
```
