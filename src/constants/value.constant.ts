export const NULL = null;
export const UNDEFINED = void 0;

export const isNull = (value): value is null => value === NULL;
export const isUndefined = (value): value is void => value === UNDEFINED;
export const isNil = (value): value is null | void => isNull(value) || isUndefined(value);

export const RANDOM_DICTIONARY = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
