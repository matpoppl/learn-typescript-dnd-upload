
class BytesFormatter
{
	prefixes = ['k','M','G','T','P','E','Z','Y','R','Q'];

	ranges;
	
	constructor(base : number = 1024)
	{
		this.ranges = this.prefixes
		.map((prefix, i) => [prefix, Math.pow(base, 1 + i)])
		.reverse();
	}
	
	format(bytes : number)
	{
		for (const [suffix, limit] of this.ranges) {
			if (bytes > limit) {
				let ret = (bytes / limit).toFixed(1);
				return `${ret}${suffix}B`;
			}
		}
		
		return `${bytes}B`;
	}
}

class ElapsedFormatter
{
	ranges : [string, number][];
	
	constructor()
	{
		this.ranges = Object.entries({
			second: 60,
			minute: 60,
			hour: 24,
			day: 30,
		});
	}
	
	format(remaining : number)
	{
		let ret = {};
		
		for (const [unit, limit] of this.ranges) {
			
			let x = remaining % limit;
			remaining -= x;
			
			if (x > 0 || x < 0) {
				ret[unit] = x;
			}
			
			if (remaining < 1) {
				break;
			}
			
			remaining /= limit;
		}
		
		return ret;
	}
}

export { BytesFormatter, ElapsedFormatter };
