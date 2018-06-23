const chokidar = require('chokidar');
const fs = require('fs');
const sha256 = require('crypto-js/sha256');
const { Maybe, Just, Nothing } = require('./maybe');
const ppf = require('./pretty-path-formatter');

let watcher, db, rootPath;

function signature(filepath) {
	const file = fs.readFileSync(filepath, { encoding: 'utf-8' });
	return sha256(file).toString();
}

function hasSignature(sign, filepath) {
	const file = fs.readFileSync(filepath, { encoding: 'utf-8' });
	return sign === sha256(file).toString();
}

function observe(path) {
	watcher = chokidar.watch(path, {
	    ignored: /(^|[\/\\])\../,
	    persistent: true
	});

	rootPath = path.split('/').pop();
	db = new Map();
	onChange();
}

function onChange(listener) {
	watcher.on('add', path => {
		db.set(ppf(rootPath, path), signature(path));
		listener({
			operation: 'add',
			path
		});
	});
	
	watcher.on('change', path => {
		db.set(ppf(rootPath, path), signature(path));
		listener({
			operation: 'change',
			path
		});
	});
	
	watcher.on('unlink', path => {
		db.delete(ppf(rootPath, path), signature(path));
		listener({
			operation: 'unlink',
			path
		});
	});
	
	watcher.on('addDir', path => {
		db.set(ppf(rootPath, path), sha256(rootPath));
		listener({
			operation: 'addDir',
			path
		});
	});

	watcher.on('unlinkDir', path => {
		db.delete(ppf(rootPath, path), sha256(rootPath));
		listener({
			operation: 'unlinkDir',
			path
		});
	});

	watcher.on('error', error => {
		console.log(error);
		listener({
			operation: 'error',
			cause: error
		});
	});
}

function snapshot() {
	const package = {
		entries: db.entries(),
		length: db.size(),
		timestamp: Date.now(),
		date: (new Date()).toISOString()
	}
	return package;
}

function keys() {
	return db.keys();
}

function length() {
	return db.size || 0;
}

module.exports = {
	observe,
	snapshot,
	keys,
	length
}