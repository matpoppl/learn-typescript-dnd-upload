import { createServer as createServerHttps } from 'https';
import { createServer as createServerHttp } from 'http';
import { extname, join } from 'path';
import { readFileSync, existsSync, realpathSync } from 'fs';

const mime = {
	'.txt': 'text/plain',
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.gif': 'image/gif',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};

function createRequestHandler(opts) {
	
	const options = {
		docRoot: '.',
		routes: {},
		...opts || {}
	};
	
	const docRoot = realpathSync(options.docRoot);
	
	return (req, res) => {

		const url = new URL(req.url, `http://${req.headers.host}`);
		const path = ('/' === url.pathname) ? '/index.html' : url.pathname;
		
		const absPath = join(docRoot, path);

		const headers = {
			'Cache-Control': 'no-store',
		};

		if (path in options.routes) {
			options.routes[path](req, res);
			return;
		}

		if (! existsSync(absPath)) {
			headers['Content-Type'] = 'text/plain';
			res.writeHead(404, headers);
			res.end(`404 File not found`);
			return;
		}

		const ext = extname(path).toLowerCase();
		if (ext in mime) {
			headers['Content-Type'] = mime[ext];
		} else {
			headers['Content-Type'] = 'application/octet-stream';
		}
		res.writeHead(200, headers);
		res.end(readFileSync(absPath));
	};
}

export function listen(opts) {
	const options = {
		port: 8080,
		host: '127.0.0.1',
		cert: null,
		key: null,
		...opts || {}
	};

	const server = (options.cert && options.key)
		? createServerHttps(options, createRequestHandler(opts))
		: createServerHttp(options, createRequestHandler(opts));

	server.listen(options.port, options.host);
	
	console.log(`Listening on http://${options.host}:${options.port}\n`);
}
