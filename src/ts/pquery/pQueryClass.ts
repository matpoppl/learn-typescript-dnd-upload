
type EachCallback = {
	(this: Element, i: number, item: Element, dataset: Iterable<any>) : boolean|void;
}

type MapCallback = {
	(this: Element, i: number, item: Element, dataset: Iterable<any>) : any;
}

class pQueryClass implements Iterable<any>
{
	length : number;
	[idx : number] : any;
	
	constructor(dataset: Iterable<any>)
	{
		var n = 0;
		$.each(dataset, (i : number, item : any) => { this[i] = item; n++; });
		this.length = n;
	}
	
	each(cb : MapCallback) : pQueryClass
	{
		$.each(this, cb);
		return this;
	}
	
	map(cb : MapCallback) : pQueryClass
	{
		return $( $.map(this, cb) );
	}
	
	is(selector : string|Function) : boolean
	{
		if ('function' === typeof(selector)) {
			return $.onFirst(this, (item : Node, key : number) => selector.call(item, key, item, this));
		}
		
		return $.onFirst(this, (_i : number, elem : Element) => elem.matches(selector) );
	}
	
	filter(selector : string|Function) : pQueryClass
	{
		if ('function' === typeof(selector)) {
			return $( Array.from(this).filter((item, key) => selector.call(item, key, item, this)) );
		}

		return $( Array.from(this).filter( (elem : Element) => elem.matches(selector) ) );
	}
	
	empty() : pQueryClass
	{
		return this.each((_i : number, parent : Node) => {
			while (parent.firstChild) parent.removeChild(parent.firstChild);
		});
	}
	
	append(children : any) : pQueryClass
	{
		return this.each((_i : number, parent : Node) => {
			$(children).each((_j : number, child : Node) => parent.appendChild(child));
		});
	}
	
	prepend(children : any) : pQueryClass
	{
		/*
		
Element.after()
Element.append()
Element.before()
Element.replaceChildren()
Element.replaceWith()
Element.prepend()

		 */
		return this.each((_i : number, parent : Node) => {
			$(children).each((_j : number, child : Node) => {
				if (parent.firstChild) {
					parent.insertBefore(parent.firstChild, child)
				}
				
				parent.appendChild(child);
			});
		});
	}
	
	parent(selector ?: string|Function) : pQueryClass
	{
		const ret = this.map((_i : number, node : Node) => node.parentNode);
		return selector ? ret.filter(selector) : ret;
	}
	
	attr(name : string, val ?: any) : pQueryClass
	{
		// remove
		if (null === val) {
			return this.each((_i : number, elem : Element) => elem.removeAttribute(name));
		}
		
		// get
		if (undefined === val) {
			return $.onFirst(this, (elem : Element) => elem.getAttribute(name));
		}
		
		// set
		return this.each((_i : number, elem : Element) => elem.setAttribute(name, val));
	}
	
	on(types : string, selector : string|ListenerCallback, data ?: any[]|ListenerCallback, cb ?: ListenerCallback, listenerOptions ?: boolean|object) : pQueryClass
	{
		const listenerConfig = new ListenerConfig(types, selector, data, cb, listenerOptions);
		
		return this.each((_i : number, target : EventTarget) => {
			
			listenerConfig.types.split(' ').forEach(type => {
				
				const listener = (evt : Event) => {
					if (false === listenerConfig.cb.call(target, evt)) {
						evt.preventDefault();
					}
				};
				
				cb.pquery[type].set(target, listener);
				
				target.addEventListener(type, listener, listenerConfig.listenerOptions);
				
			});
			
		});
	}
	
	one(types2 : string, selector2 : string|ListenerCallback, data2 ?: any[]|ListenerCallback, cb2 ?: ListenerCallback, listenerOptions2 ?: object) : pQueryClass
	{
		const listenerConfig = new ListenerConfig(types2, selector2, data2, cb2, Object.assign({ once : true }, listenerOptions2 || {}));
		
		const { types, selector, data, cb, listenerOptions } = listenerConfig;
		
		return this.on(types, selector, data, cb, listenerOptions);
	}
	
	off(types : string, cb: ListenerCallback)
	{
		
		return this.each((_i : number, target : EventTarget) => {
			
			types.split(' ').forEach(type => {
				
				if (type in cb.pquery && cb.pquery[type].has(target)) {
					target.removeEventListener(type, cb.pquery[type].get(target));
				}
				
			});
			
		});
	}
	
	[Symbol.iterator]()
	{
		let i = 0;
		return {
			next: () => (i < this.length)
			? { value: this[i++], done: false }
			: { value: undefined, done: true }
		};
	}
}

type CallbacksMap = {
	[idx: string] : Map<EventTarget, EventListener>;
};

type ListenerCallback = {
	pquery : CallbacksMap;
	(this: EventTarget, evt: Event) : boolean|void;
}

class ListenerConfig
{
	types : string;
	selector ?: string;
	data ?: any[];
	cb : ListenerCallback;
	listenerOptions ?: boolean|object;
	
	constructor(types : string, selector : string|ListenerCallback, data ?: any[]|ListenerCallback, cb ?: ListenerCallback, listenerOptions ?: boolean|object)
	{
		this.types = types;
		this.listenerOptions = listenerOptions;
		
		if ('function' === typeof(cb)) {
			this.cb = cb;
			this.data = data as any[];
			this.selector = selector as string;
		} else if ('function' === typeof(data)) {
			this.cb = data as ListenerCallback;
			this.selector = selector as string;
		} else if ('function' === typeof(selector)) {
			this.cb = selector as ListenerCallback;
		} else {
			throw new Error('Unexpected parameters');
		}
		
		if (! ('pquery' in this.cb)) {
			this.cb = Object.assign(this.cb, {
				pquery: {},
			});
		}
		
		this.types.split(' ').forEach(type => {
			this.cb.pquery[type] = new Map();
		});
	}
}

function pQueryFunc(selector : any, context ?: Element) : pQueryClass
{
	if (selector instanceof pQueryClass) {
		return selector;
	}
	
	var dataset : Iterable<any>;
	
	if ($.isString(selector)) {
		dataset = (context || document).querySelectorAll(selector);
	} else if ($.isArray(selector)) {
		dataset = selector;
	} else if (selector) {
		dataset = [selector];
	} else {
		dataset = [];
	}
	
	return new pQueryClass(dataset);
}

const pQueryStatic = {
	each(iterable: Iterable<any>, cb : EachCallback)
	{
		Array.from(iterable).some( (value, key) => false === cb.call(value, key, value, iterable) );
	},
	
	map(iterable: Iterable<any>, cb : MapCallback)
	{
		return Array.from(iterable).map( (value, key) => cb.call(value, key, value, iterable) );
	},
	
	isString(val : any) : boolean
	{
		return 'string' === typeof(val) || val instanceof String;
	},
	
	isArray(val : any) : boolean
	{
		return Array.isArray(val);
		//return (Symbol.iterator in val) || val instanceof Array;
	},
	
	onFirst(iterable : Iterable<any>, cb : Function) : any
	{
		for (const [key, item] of iterable) {
			return cb.call(item, item, key);
		}
	}
}

const $ = Object.assign(pQueryFunc, pQueryStatic);

/*
Node.baseURI
Node.childNodes
Node.firstChild
Node.isConnected
Node.lastChild
Node.nextSibling
Node.nodeName
Node.nodeType
Node.nodeValue
Node.ownerDocument
Node.parentElement
Node.parentNode
Node.previousSibling
Node.textContent

Node.cloneNode()

Node.compareDocumentPosition()
Node.contains()
Node.getRootNode()
Node.hasChildNodes()


Node.isDefaultNamespace()
Node.isEqualNode()
Node.isSameNode()
Node.lookupNamespaceURI()
Node.lookupPrefix()
Node.normalize()

Element.ariaValueText
Element.assignedSlot
Element.attributes
Element.childElementCount
Element.children
Element.classList
Element.className
Element.clientHeight
Element.clientLeft
Element.clientTop
Element.clientWidth
Element.firstElementChild
Element.id
Element.innerHTML
Element.lastElementChild
Element.localName
Element.namespaceURI
Element.nextElementSibling
Element.outerHTML
Element.part
Element.prefix
Element.previousElementSibling
Element.scrollHeight
Element.scrollLeft
Element.scrollTop

Element.scrollWidth
Element.shadowRoot
Element.slot
Element.tagName

Element.querySelector()
Element.querySelectorAll()

Element.remove()

Element.closest()


Element.computedStyleMap()
Element.getAnimations()

Element.getBoundingClientRect()
Element.getClientRects()

Element.hasPointerCapture()
Element.insertAdjacentElement()
Element.insertAdjacentHTML()
Element.insertAdjacentText()


*/

export default $;

