## Definition

zilez is a library to watch changes inside a givin path, can generate signatures of files and snapshots of directory.

Is built using chokidar and crypto-js.

## API

#### observe(path, listener)

Take a full path to a directory and a listener that will be called on every file or directory changes.

Example:
```javascript
zz.observe('/home', p => console.log(p));
```

#### snapshot()

Return a snapshot from current state of directory

Example:
```
const snapshot = zz.snapshot();
// snapshot is
{
    entries: array of (key, value) with all files and signatures,
    length: number of files and directories in this directory,
    timestamp: a time stamp
    date: pretty date when this package was created
}
```

## How to use

```javascript
const zz = require('zilez');

// root path and a handler that receive a package
zz.observe('/home', p => {
    if (p.error) console.log(p.error);
    else {
        console.log('package', p);

        // take a snapshot of actual state of directory
        const snap = zz.snapshot();

        // take a array of files that are grabbed by watcher
        const files = zz.files();

        // take the number of files and directories inside 
        // the root directory
        const length = zz.length();
    }
```