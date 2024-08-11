
/**
 * Quebra em linhas um array
 * Caso a linha esteja vazia pule
 * Caso seja o ultimo elemento da array, não quebre a linha
 *
 * @export
 * @param {string[]} array
 * @returns {string}
 */
export function breakLines(array: string[]): string {
  let result = ''

  for (let int = 0; int < array.length; int++) {
    if (array[int].length === 0) continue

    result += array[int]
    if (int !== array.length -1) {
      result += '\n'
    }
  }
  return result
}