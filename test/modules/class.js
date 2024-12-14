class Pessoa {
  constructor(nome, idade) {
    this.nome = nome
    this.idade = idade
  }

  cumprimentar() {
    return `Hello, my name is ${this.nome} and I'm ${this.idade} years old`
  }
}

const pessoa = new Pessoa('Matheus', '19')
console.log(pessoa.cumprimentar())