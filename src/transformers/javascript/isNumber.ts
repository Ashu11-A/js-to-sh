/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Valida se o input é um numero.
 *
 * @param {*} num
 * @returns {boolean}
 */
const isNumber = (num: any) => {
  return !Number.isNaN(Number(num))
}
global.isNumber = isNumber
export { isNumber }