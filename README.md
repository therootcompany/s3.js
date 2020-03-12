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
    body
})
```
