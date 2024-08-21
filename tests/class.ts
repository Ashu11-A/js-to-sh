class Pessoa {
  constructor(nome, idade) {
    this.nome = nome
    this.idade = idade
  }

  cumprimentar() {
    return `Olá, meu nome é ${this.nome} e eu tenho ${this.idade} anos.`
  }
}

const pessoa = new Pessoa('Matheus', '18')
console.log(pessoa.cumprimentar())