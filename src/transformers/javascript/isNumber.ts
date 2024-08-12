// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(num: any) {
  return !Number.isNaN(Number(num))
}