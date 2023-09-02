export function isPlainObject(value: unknown) {
	return typeof value === 'object' && value !== null && value.constructor === Object;
}