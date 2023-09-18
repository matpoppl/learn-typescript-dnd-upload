import $ from './pquery/pQueryClass';

import { attachListeners } from './utils/EventsHelper';
import { Uploader } from './utils/HttpUploader';
import { createProxy } from './utils/NodeProxy';
import { BytesFormatter } from './utils/Formatters';

interface UploadNodes {
	progress?: HTMLProgressElement;
	perc?: Element;
	ext?: Element;
	mime?: Element;
	transfered?: Element;
	['size-loaded']?: Element;
	['size-total']?: Element;
	abort?: Element;
	errors?: Element;
	done?: Element;
}

interface UploadData {
	progress?: number;
	perc?: number;
	ext?: string;
	mime?: string;
	transfered?: number;
	['size-loaded']?: number;
	['size-total']?: number;
	errors?: string[];
	done?: boolean;
}

interface UploadProxy {
	nodes: UploadNodes,
	proxy: UploadData,
}

const uploader = new Uploader({
	responseType: 'json',
});
const list: HTMLUListElement = document.querySelector('#list');
const template: HTMLTemplateElement = document.querySelector('template');
const bytesFmtr = new BytesFormatter();

$('.js-dnd-form').each((_i, form: HTMLFormElement) => {

	attachListeners(form, {
		dragover: () => false,
		drop(evt: DragEvent) {
			evt.preventDefault();
			if (evt.dataTransfer.files.length < 1) return;
			const input: HTMLInputElement = form.querySelector('input[type="file"]');
			input.files = evt.dataTransfer.files;
			form.dispatchEvent(new CustomEvent('input'));
		},
		input() {

			const input: HTMLInputElement = form.querySelector('input[type="file"]');

			const data = new FormData(form);

			Array.from(input.files).forEach((file) => {

				data.set(input.name, file);

				const uploadItem = document.createElement("li");

				list.appendChild(uploadItem).appendChild(template.content.cloneNode(true));

				const { proxy, nodes }: UploadProxy = createProxy(uploadItem as Element, {
					selectorPattern: '.upload-item__%s',
					names: 'progress,perc,ext,mime,size-loaded,size-total,abort,errors,done'.split(',')
				}, {
					progress: 0,
					perc: 0,
					ext: file.name.split('.').pop(),
					mime: file.type,
					'size-loaded': 0,
					'size-total': file.size,
					errors: [],
					done: false
				}, {
					progress(node: HTMLProgressElement, value: number) { node.value = value; },
					perc(node: Node, value: string) { node.textContent = value; },
					ext(node: Node, value: string) { node.textContent = value; },
					mime(node: Node, value: string) { node.textContent = value; },
					errors(node: Element, msgs: string[]) {
						node.innerHTML = msgs.map(msg => `<li>${msg}</li>`).join('');
					},
					['size-loaded'](node: Node, value: number) { node.textContent = bytesFmtr.format(value); },
					['size-total'](node: Node, value: number) { node.textContent = bytesFmtr.format(value); },
					done(node: Element, done: boolean) { done ? node.removeAttribute('hidden') : node.setAttribute('hidden', '') },
				});

				nodes?.abort.addEventListener('click', () => {

					uploadItem.remove();
					//xhr.abort();

				});

				uploader.upload(form.action, data, ({ loaded, total }) => {

					let progress = loaded / total;

					proxy['size-loaded'] = loaded;
					proxy.progress = progress;
					proxy.perc = Math.round(progress * 100);

				}).then(() => {
					proxy.done = true;
				}, (arg) => {
					proxy.errors = arg.xhr.response.messages;
				}).finally(() => {
					// emulate finish
					//setTimeout(() => uploadItem.remove(), 5000);
				});

			});
		}
	});

});

