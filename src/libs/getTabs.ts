
/**
 * Retorna o indent para melhor formatação do shell script
 *
 * @export
 * @param {number} tabs
 * @returns {*}
 */
export function getTabs (tabs: number) {
  return '  '.repeat(tabs)
}