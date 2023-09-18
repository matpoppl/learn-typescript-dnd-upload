import { Transform } from 'stream';
import { rollup } from 'rollup';

export default function (inputOptions, outputOptions, postOptions)
{
	const transformStream = new Transform({objectMode: true});
	
	transformStream._transform = function(file, encoding, callback) {
		
		if (file.isNull()) {
			return callback(new Error('NULL unsupported'), null);
		}
		
		if (file.isStream()) {
			return callback(new Error('Stream unsupported'), null);
		}

		rollup(Object.assign({
			input: file.path,
		}, inputOptions)).then((bundle) => bundle.generate(Object.assign({
			name: file.stem,
		}, outputOptions))).then(({ output }) => {
			
			Array.from(output).filter(({ type }) => 'chunk' === type).forEach(({ code, name }) => {
				
				if ('rename' in postOptions) {
					postOptions.rename(file);
				}
				
				file.stem = name;
				file.contents = Buffer.from(code, encoding);
				
				callback(null, file);
				
			});
		});

	};

	return transformStream;
}
