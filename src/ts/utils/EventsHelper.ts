
type ListenerSignature = {
  (evt: Event) : boolean | void;
};

type MapListener = {
  [key : string] : ListenerSignature;
};

function attachListeners(target : EventTarget, listeners : MapListener)
{
	for (const [type, cb] of Object.entries(listeners)) {
		
		target.addEventListener(type, (evt) => {
			if (false === cb.call(target, evt)) {
				evt.preventDefault();
			}
		});
	}
}

export type { ListenerSignature, MapListener };

export { attachListeners };
