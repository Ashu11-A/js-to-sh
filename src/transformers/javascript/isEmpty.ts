/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Valida se o input de algo é vazio
 *
 * @param {any} content
 * @returns {boolean}
 */
const isEmpty =  (content: any): boolean => {
  switch (typeof content) {
  case 'undefined': {
    return true
  }
  default: {
    return false
  }
  }
}
global.isEmpty = isEmpty
export { isEmpty }
