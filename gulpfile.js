import { readFileSync as fread } from 'fs';

import gulp from 'gulp';

import rollup from './gulp-plugins/rollup.js';

//import tslib from 'typescript';
import typescript from '@rollup/plugin-typescript';

import livereload from 'gulp-livereload';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';

import { listen as devServerListen } from './gulp-plugins/dev-server.js';

const sass = gulpSass(dartSass);

const devTs = () => gulp.src('src/ts/*.ts')
.pipe(rollup({
	external: ['jquery'],
	plugins: [
		typescript()
	],
}, {
	format: 'iife',
	globals: {
		'$': 'jQuery',
		'jQuery': '$',
	}
}, {
	rename(file)
	{
		file.extname = '.js';
	}
}))
.pipe(gulp.dest('dist/static/js'))
.pipe(livereload());

const devScss = () => gulp.src('src/scss/*.scss')
.pipe(sass().on('error', sass.logError))
.pipe(gulp.dest('dist/static/css'))
.pipe(livereload());

const devHTML = () => gulp.src('dist/*.html', { since: gulp.lastRun(devHTML) })
.pipe(livereload());

function devServerListenInit(cb)
{
	devServerListen({
		docRoot: 'dist',
		routes: {
			'/upload': (_, res) => {
				
				res.writeHead(400, {
					'Cache-Control': 'no-store',
					'Content-Type': 'application/json; charset=UTF-8',
				});
				res.end(JSON.stringify({
					status: 'ERROR',
					messages: ['File size limit exeeded'],
				}));
			},
		}
	});
	cb();
}

function livereloadListen(cb)
{
	const { PATH_CERTS } = process.env;
	
	livereload.listen({
		port: 35729,
		host: '127.0.0.1',
		//cert: fread(`${PATH_CERTS}/localhost-cert.pem`),
		//key: fread(`${PATH_CERTS}/localhost-key.pem`),
	});
	cb();
}

function watch(cb)
{
	gulp.watch('src/ts/**/*.ts', devTs);
	gulp.watch('src/scss/**/*.scss', devScss);
	gulp.watch('dist/*.html', devHTML);
	cb();
}

const dev = gulp.parallel(devScss, devTs);

export default gulp.series(gulp.parallel(devServerListenInit, livereloadListen, dev), watch);
