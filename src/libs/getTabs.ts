export function getTabs (tabs: number) {
  let tab = ''
  for (let int = 0; int < tabs; int++) {
    tab += '  '
  }

  return tab
}