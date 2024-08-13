interface MoneyOptions {
    cotação: number
    dinheiro: number
}

class Money {
  private readonly cotação: number
  private readonly dinheiro: number

  constructor ({ cotação, dinheiro }: MoneyOptions) {
    this.cotação = cotação
    this.dinheiro = dinheiro
  }

  conversion () {
    return this.cotação * this.dinheiro
  }
}

const conversion = new Money({ cotação: 5.89, dinheiro: 2 }).conversion()

console.log(conversion)

function conversionMoney ({ cotação, dinheiro }: MoneyOptions) {
  return cotação * dinheiro
}

console.log(conversionMoney({  cotação: 5.89, dinheiro: 2 }))
