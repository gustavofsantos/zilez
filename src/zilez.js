const chokidar = require('chokidar');
const fs = require('fs');
const sha256 = require('crypto-js/sha256');
const ppf = require('./pretty-path-formatter');

let watcher, db, rootPath;


/**
 * Generate a signature of a file
 * @param {string} filepath 
 */
function signature(filepath) {
	const file = fs.readFileSync(filepath, { encoding: 'utf-8' });
	return sha256(file).toString();
}

/**
 * Compare if a file has the signature
 * @param {string} sign signature of a file
 * @param {string} filepath path to another file
 */
function hasSignature(sign, filepath) {
	const file = fs.readFileSync(filepath, { encoding: 'utf-8' });
	return sign === sha256(file).toString();
}

/**
 * Observe a directory
 * @param {string} path full path to one directory
 * @param {function} handler function that handle changes
 */
function observe(path, handler) {
	watcher = chokidar.watch(path, {
	    ignored: /(^|[\/\\])\../,
	    persistent: true
	});

	rootPath = path.split('/').pop();
	db = new Map();
	console.log('rootpath: ', rootPath);
	onChange(handler);
}

/**
 * Listen for changes inside directory
 * @param {Function} listener 
 */
function onChange(listener) {
	watcher.on('add', path => {
		db.set(ppf(rootPath, path), signature(path));
		listener({
			operation: 'add',
			path: ppf(rootPath, path)
		});
	});
	
	watcher.on('change', path => {
		db.set(ppf(rootPath, path), signature(path));
		listener({
			operation: 'change',
			path: ppf(rootPath, path)
		});
	});
	
	watcher.on('unlink', path => {
		db.delete(ppf(rootPath, path), signature(path));
		listener({
			operation: 'unlink',
		});
	});
	
	watcher.on('addDir', path => {
		db.set(ppf(rootPath, path), sha256(rootPath));
		listener({
			operation: 'addDir',
			path: ppf(rootPath, path)
		});
	});
	
	watcher.on('unlinkDir', path => {
		db.delete(ppf(rootPath, path), sha256(rootPath));
		listener({
			operation: 'unlinkDir',
			path: ppf(rootPath, path)
		});
	});

	watcher.on('error', error => {
		console.log(error);
		listener({
			error
		});
	});
}

/**
 * Get the current state of directory
 * @returns {object}
 */
function snapshot() {
	const package = {
		entries: db.entries(),
		length: db.size(),
		timestamp: Date.now(),
		date: (new Date()).toISOString()
	}
	return package;
}

/**
 * Return all files and directories inside the root directory
 * @returns {array}
 */
function files() {
	return db.keys();
}

/**
 * Number of files and directories that are tracked
 * @returns {number}
 */
function length() {
	return db.size || 0;
}

module.exports = {
	observe,
	snapshot,
	files,
	length
}