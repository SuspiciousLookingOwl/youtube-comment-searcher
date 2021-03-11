const debounce = <T extends Function>(cb: T, wait = 20) => {
	let h: NodeJS.Timeout;
	let callable = (...args: any) => {
		clearTimeout(h);
		h = setTimeout(() => cb(...args), wait);
	};
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return <T>(<any>callable);
};

export default debounce;
