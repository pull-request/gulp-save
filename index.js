'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var cache = {};

module.exports = function (store) {
	if (!store || typeof store !== 'string') {
		throw new gutil.PluginError('gulp-save', '`store` parameter must be string');
	}

	var firstFile = false;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			cb();
			return;
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-save', 'Streaming not supported'));
			cb();
			return;
		}

		if (!firstFile) {
			cache[store] = [];
			firstFile = true;
		}

		cache[store].push(file);
		this.push(file);
		cb();
	});
};

module.exports.restore = function (store) {
	if (!store || typeof store !== 'string') {
		throw new gutil.PluginError('gulp-save', '`store` parameter must be string');
	}

	return through.obj(function (file, enc, cb) {
		cb();
	}, function () {

		if (!cache[store]) {
			gutil.log('gulp-save', gutil.colors.red('cache for `'+ store +'` not found'));
		}

		cache[store].forEach(this.emit.bind(this, 'data'));
		this.emit('end');
	});
};
