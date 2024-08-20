// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.isNumber = (num: any) => {
  return !Number.isNaN(Number(num))
}