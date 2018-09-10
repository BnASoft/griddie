export const isPromise = object => !!object && (typeof object === 'object' || typeof object === 'function') && typeof object.then === 'function';
