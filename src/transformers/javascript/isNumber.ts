// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNumber = (num: any) => {
  return !Number.isNaN(Number(num))
}
global.isNumber = isNumber
export { isNumber }