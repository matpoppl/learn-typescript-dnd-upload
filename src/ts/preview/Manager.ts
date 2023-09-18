
import { attachListeners } from './../utils/EventsHelper';

interface PreviewLoader
{
	preview(file : File) : Promise<Element>;
	supports(file : File) : boolean;
}

class ImagePreviewLoader implements PreviewLoader
{
	supports(file : File)
	{
		return file.type.startsWith('image/');
	}
	
	preview(file : File) : Promise<Element>
	{
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

		    attachListeners(reader, {
		
				error() {
					reject(new Error('Event.target result required'));
				},
				
				load(evt : Event) {
					
					if (! ('result' in evt.target)) {
						return reject(new Error('Event.target result required'));
					}
					
					const img = new Image();
					
		    		attachListeners(img, {
						error() {
							reject();
						},
						load() {
							resolve(img);
						}
					});
		    		
					img.src = evt.target.result as string;
				}
			});
			
		    reader.readAsDataURL(file);
		});
	}
}
class FallbackPreviewLoader implements PreviewLoader
{
	supports(file : File)
	{
		return true;
	}
	
	preview(file : File) : Promise<Element>
	{
		return new Promise((resolve) => {
			
			const div = document.createElement('div');
			div.innerHTML = `<span>[FILE]</span>`;
			
			resolve(div.firstElementChild);
		});
	}
}

class PrevewManager
{
	loaders : PreviewLoader[];
	
	constructor()
	{
		this.loaders = [
			new ImagePreviewLoader(),
			new FallbackPreviewLoader(),
		];
		
	}
	
	preview(file : File) : Promise<Element>
	{
		return new Promise(async (resolve, reject) => {
			
			var lastError = new Error('Unsupported loader');
			
			for (const loader of this.loaders) {
				if (loader.supports(file)) {
					try {
						const elem = await loader.preview(file);
						return resolve(elem);
					} catch (err) {
						// todo log
						lastError = err;
					}
				}
			}
			
			reject(lastError);
		});
	}
}

export { PrevewManager };

