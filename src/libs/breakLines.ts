
/**
 * Quebra um array em linhas
 * Caso a linha esteja vazia, pule!
 * Caso seja o ultimo elemento da array, não quebre a linha.
 *
 * @export
 * @param {string[]} array
 * @returns {string}
 */
export function breakLines(array: (string | number)[]): string {
  let result = ''

  const args = array.filter((arg) => typeof arg === 'string' ? arg.length !== 0 : true)
  
  for (let int = 0; int < args.length; int++) {
    if (typeof args[int] === 'string' ? (args[int] as string).length === 0 : false) continue

    result += args[int]
    if (int !== args.length -1) {
      result += '\n'
    }
  }
  return result
}