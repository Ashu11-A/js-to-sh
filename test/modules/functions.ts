function some (num1, num2) {
  return num1 + num2
}

function string (str1, str2) {
  return `${str1} ${str2}`
}

const result = some(1, 2)

console.log(string('teste', 'teste'))
console.log(result)