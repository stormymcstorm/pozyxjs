/**
 * Creates a bit mask form a array of booleans
 * 
 * @param arr the state of each bit. {@code true} for 1 and {@code false} for 0
 * @returns {number}  the bit mask
 */
export function maskFromArray(arr: boolean[]): number {
  if (arr.length > 32)
    throw new RangeError('cannot create a bitmask longer than 32 bits');

  let bm = 0;

  for (let i = 0; i < arr.length; bm |= +arr[i] << i++);

  return bm;
}

/**
 * Creates a boolean array from a bit mask
 * 
 * @param mask the mask to create a boolean array from
 * @returns {boolean[]} the boolean array
 */
export function arrayFromMask(mask: number): boolean[] {
  if (mask < (1 << 31) || mask > ~(1 << 31))
    throw new RangeError('mask is out of range: ' + mask);

  const arr = [];

  for (let shifted = mask; shifted; shifted >>>= 1)
    arr.push((shifted & 1) == 1);

  return arr;
}

/**
 * Asserts that the function call was successful
 * 
 * @param ok whether or not the function call was successful
 */
export function assertFunctionCallSuccess(ok: boolean) {
  if (! ok)
    throw new Error('Function call failed');
}
