# [s3.js](https://git.rootprojects.org/root/s3.js) | a [Root](https://rootprojects.org) project

> Minimalist S3 client \
> (for AWS, Minio, Digital Ocean Spaces, etc)

A lightweight alternative to the S3 SDK that uses only @root/request and aws4.

-   set()
-   get()
-   head()
-   delete()
-   sign()

### Download a file from S3

```js
s3.get({
    accessKeyId,        // 'AKIAXXXXXXXXXXXXXXXX'
    secretAccessKey,    // 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    region,             // 'us-east-2'
    bucket,             // 'bucket-name'
    prefix,             // 'my-prefix/' (optional)
    key                 // 'data/stats.csv' (omits prefix, if any)
});
```

### Upload a new file to S3

```js
s3.set({
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
    prefix,
    key,
    body,               // new Buffer("hello, world")
                        // or fs.createReadStream("./file.txt")

    size                // fs.stat("./file.txt").size (required for streams)
});
```

### Return signed URL without fetching.

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

### A note on S3 terminology

|                         |                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bucket`                | most similar to what most people think of as a "**folder**"<br>**MUST NOT** contain a slash `/`                                                              |
| `key`<br>("object key") | most similar to a "**file name**"<br>may contain "**/**"s as part of the name<br>**MUST NOT BEGIN** with a slash `/`                                         |
| `prefix`                | an informal term, refers to "**file path**"<br>what the AWS console uses for created virtual folder-like views and searches<br>**MUST END** with a slash `/` |

This library provides `prefix` (of `key`) for convenience.

`s3://bucket-name/long/prefix/data/stats.csv` can be represented equally well by any of the following:

(no prefix)

```json
{
    "bucket": "bucket-name",
    "prefix": "",
    "key": "long/prefix/data/stats.csv"
}
```

(with long prefix)

```json
{
    "bucket": "bucket-name",
    "prefix": "long/prefix/data/",
    "key": "stats.csv"
}
```

(with short prefix)

```json
{
    "bucket": "bucket-name",
    "prefix": "long/",
    "key": "prefix/data/stats.csv"
}
```

### Troubleshooting

If the body is a stream then `size` must be set to `fs.statSync(filePath).size`, or the request will fail:

```
501
<Code>NotImplemented</Code><Message>A header you provided implies functionality that is not implemented</Message>
```
