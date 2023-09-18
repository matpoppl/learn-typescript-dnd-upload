
// <a :href="janko" :title="biodro">{{ biodro }}</a>
// setAttribute('href', data.janko)
// setAttribute('title', data.biodro)
// textContent = data.biodro

interface ProxySetters
{
	[idx : string] : Function;
}

function createDataProxy(setters : ProxySetters, data = {})
{
	const proxy = {};
	
	Object.keys(setters).forEach(name => {
		Object.defineProperty(proxy, name, {
		  enumerable: true,
		  get: () => data[name],
		  set: (val) => {
			  data[name] = val;
			  setters[name](val);
		  },
		});
	});
	
	Object.keys(setters).forEach(name => {
		proxy[name] = data[name];
	});

	return proxy;
}

interface NodeProxy
{
	[idx : string] : Element;
}

function createNodeProxy(wrap : Element, names : string[], selectorPattern = null) : NodeProxy
{
	if (! selectorPattern) {
		selectorPattern = '%s';
	}
	
	return Object.fromEntries( names.map((name) => [name, wrap.querySelector(selectorPattern.replace('%s', name))]) );
}

interface ProxyNames
{
	names : string[];
	selectorPattern ?: string;
}

interface Proxy
{
	nodes: NodeProxy,
	proxy: ProxySetters,
}

function createProxy(wrap : Element, names : string[]|ProxyNames, data : object, setters : ProxySetters) : Proxy
{
	var selectorPattern = ('selectorPattern' in names) ? names.selectorPattern : null;
	
	if ('names' in names) {
		names = names.names;
	}
	
	const nodes = createNodeProxy(wrap, names as string[], selectorPattern);
	
	const contextedSetters = Object.entries(setters)
	.filter( ([name]) => nodes[name] )
	.map(([name, setter]) => [name, (val : any) => {
		setter(nodes[name], val);
	}]);
	
	const proxy = createDataProxy(Object.fromEntries(contextedSetters), data);

	// set init values
	Array.from( Object.keys(data) ).forEach((name) => {
		proxy[name] = data[name];
	});
	
	return {
		nodes,
		proxy
	};
}

export { createDataProxy, createNodeProxy, createProxy };
