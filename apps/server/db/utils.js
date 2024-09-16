/**
 * Used to remove "null" relational value.
 *
 * Using json_object to select relational values occurs null when there's no data to put into object.
 * That is why this function exists, to remove object with null and make array really empty.
 *
 * @param {string} arr - JSON array that has objects to check
 * @param {string} key - Object's key to check (should use non-nullable column)
 * @returns {T[]}
 */
export async function relational(arr, key) {
  return JSON.parse(arr).filter(obj => obj[key] !== null);
}
