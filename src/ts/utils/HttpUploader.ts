
import { attachListeners } from './EventsHelper';

enum HTTP_METHOD {
  POST = 'POST',
  PUT = 'PUT',
}

type ProgressListenerSignature = {
  (evt: ProgressEvent) : void;
};

interface UploaderInterface
{
	upload(url: string, data : XMLHttpRequestBodyInit, progress : ProgressListenerSignature, method ?: HTTP_METHOD) : Promise<XMLHttpRequest>;
}

interface PromisedResponse
{
	event: Event;
	xhr: XMLHttpRequest;
}

interface UploaderOptions
{
	responseType?: XMLHttpRequestResponseType;
}

class Uploader implements Uploader
{
	options: UploaderOptions;
	
	constructor(options: UploaderOptions)
	{
		this.options = options;
	}
	
	upload(url: string, data : XMLHttpRequestBodyInit, progress : ProgressListenerSignature, method ?: HTTP_METHOD ) : Promise<PromisedResponse>
	{
		if (! method) {
			method = HTTP_METHOD.POST;
		}
		
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			
			xhr.responseType = ('responseType' in this.options) ? this.options.responseType : '';
			
			attachListeners(xhr.upload, {
				progress(evt : ProgressEvent) {
					if (evt.lengthComputable) {
						progress(evt);
					} 
				},
			});
			
			attachListeners(xhr, {
				abort(event) {
					reject({ event, xhr });
				},
				error(event) {
					reject({ event, xhr });
				},
				load(event) {
					if (200 === xhr.status) {
						resolve({ event, xhr });
					} else {
						reject({ event, xhr });
					}
				},
			});
			
			xhr.open(method as string, url);
			xhr.send(data);
		});
	}
}

export { Uploader };

export type { HTTP_METHOD, ProgressListenerSignature, UploaderInterface };
