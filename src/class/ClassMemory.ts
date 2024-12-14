export class ClassMemory {
  public static all = new Map<string, ClassMemory>()
  
  /**
   * Nome da classe utilizada
   */
  name: string
  
  /**
   * Constrante que usa a class
   */
  constant: string

  constructor (options: ClassMemory) {
    this.name = options.name
    this.constant = options.constant

    ClassMemory.all.set(this.name, this)
  }
}