
import { RectangleShape } from './RectangleShape';
import type { Align } from './RectangleShape';

enum ResizeMode {
	COVER,
	CONTAIN,
	RESIZE
};

class ResizeStruct
{
	canvas : RectangleShape;
	source : RectangleShape;
	destination : RectangleShape;

    constructor(canvas : RectangleShape,  source : RectangleShape,  destination : RectangleShape)
    {
        this.canvas = canvas;
        this.source = source;
        this.destination = destination;
    }

    getCanvas()
    {
        return this.canvas;
    }

    getSource()
    {
        return this.source;
    }

    getDestination()
    {
        return this.destination;
    }
    
	static resize(fromWidth : number, fromHeight : number, toWidth : number, toHeight : number, mode ?: ResizeMode, align ?: Align)
    {
		if (null === mode) {
			mode = ResizeMode.COVER;
		}
		
		let destination : RectangleShape;
		let source : RectangleShape;
		let tmp : RectangleShape;
		
        switch (mode) {
            case ResizeMode.COVER:
                
                destination = new RectangleShape(toWidth, toHeight);
                
                source = destination.resize(fromWidth, fromHeight, align);
                
                return new ResizeStruct(destination, source, destination);
            case ResizeMode.CONTAIN:
                
                source = new RectangleShape(fromWidth, fromHeight);
                
                destination = source.resize(toWidth, toHeight, align);
                
                return new ResizeStruct(new RectangleShape(toWidth, toHeight), source, destination);
            case ResizeMode.RESIZE:
                
                source = new RectangleShape(fromWidth, fromHeight);
                
                tmp = source.resize(toWidth, toHeight);
                
                destination = new RectangleShape(tmp.getWidth(), tmp.getHeight());
                
                return new ResizeStruct(destination, source, destination);
        }
        
        //throw new Error('Unsupported mode');
    }
}

export type { ResizeMode, Align };

export { ResizeStruct };
