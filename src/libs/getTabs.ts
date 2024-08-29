
/**
 * Retorna o indent para melhor formatação no shell script
 *
 * @export
 * @param {number} tabs
 * @returns {string}
 */
export function getTabs (tabs: number): string {
  return '  '.repeat(tabs)
}