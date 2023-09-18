
enum Align {
	TOP_LEFT,
	TOP_CENTER,
	TOP_RIGHT,
	MID_LEFT,
	MID_CENTER,
	MID_RIGHT,
	BOT_LEFT,
	BOT_CENTER,
	BOT_RIGHT,
};

class RectangleShape
{
    left : number;
    private top : number;
    private width : number;
    private height : number;
    
    constructor(width : number, height : number, left : number = 0, top : number = 0)
    {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    
    getLeft()
    {
        return this.left;
    }
    
    getTop()
    {
        return this.top;
    }
    
    getWidth()
    {
        return this.width;
    }
    
    getHeight()
    {
        return this.height;
    }

    resize(destWidth : number, destHeight : number, align ?: Align)
    {
		if (null === align) {
			align = Align.MID_CENTER;
		}
		
		let newWidth : number;
		let newHeight : number;
		let newLeft : number = 0;
		let newTop : number = 0;
		
        if (this.height / this.width > destHeight / destWidth) {
            newWidth = this.width * (destHeight / this.height);
            newHeight = destHeight;
        } else {
            newWidth = destWidth;
            newHeight = this.height * (destWidth / this.width);
        }
        
        switch (align) {
            case Align.TOP_LEFT:
            case Align.MID_LEFT:
            case Align.BOT_LEFT:
                newLeft = 0;
                break;
            case Align.TOP_CENTER:
            case Align.MID_CENTER:
            case Align.BOT_CENTER:
                newLeft = (destWidth - newWidth) / 2;
                break;
            case Align.TOP_RIGHT:
            case Align.MID_RIGHT:
            case Align.BOT_RIGHT:
                newLeft = (destWidth - newWidth);
                break;
        }
        
        switch (align) {
            case Align.TOP_LEFT:
            case Align.TOP_CENTER:
            case Align.TOP_RIGHT:
                newTop = 0;
                break;
            case Align.MID_LEFT:
            case Align.MID_CENTER:
            case Align.MID_RIGHT:
                newTop = (destHeight - newHeight) / 2;
                break;
            case Align.BOT_LEFT:
            case Align.BOT_CENTER:
            case Align.BOT_RIGHT:
                newTop = (destHeight - newHeight);
                break;
        }
        
        return new RectangleShape(newWidth, newHeight, newLeft, newTop);
    }
}

export type { Align };

export { RectangleShape };
