
/**
 * Quebra um array em linhas
 * Caso a linha esteja vazia, pule!
 * Caso seja o ultimo elemento da array, não quebre a linha.
 *
 * @export
 * @param {string[]} array
 * @returns {string}
 */
export function breakLines(array: string[]): string {
  let result = ''

  const args = array.filter((arg) => arg.length !== 0)
  
  for (let int = 0; int < args.length; int++) {
    if (args[int].length === 0) continue

    result += args[int]
    if (int !== args.length -1) {
      result += '\n'
    }
  }
  return result
}