// The Cadastro de Pessoa Física (CPF) is a national brazilian document
// which identifies uniquely a person.

export default class CPF {
  public readonly code: string;

  constructor(documentNumber: string) {
    this.code = documentNumber.replace(/\./g, '').replace('-', '');
  }

  public isValid(): boolean {
    // a CPF document must have exactly 11 digits and contain only digits
    if (!RegExp(/\d{11}/g).test(this.code)) {
      return false;
    }

    const strippedDocument: number[] = Array.from(this.code).map((digit) =>
      parseInt(digit, 10),
    );

    const calculatedDigitoVerificador: string =
      this.calculateFirstDigitoVerificador(strippedDocument) +
      this.calculateSecondDigitoVerificador(strippedDocument);

    return calculatedDigitoVerificador === this.code.slice(-2);
  }

  private calculateFirstDigitoVerificador(documentNumber: number[]): string {
    const checkSum = documentNumber
      .slice(0, 9)
      .reduce((previousResult: number, currentDigit: number, index: number) => {
        return currentDigit * (10 - index) + previousResult;
      }, 0);

    return String(this.generateDigitoVerificador(checkSum));
  }

  private calculateSecondDigitoVerificador(documentNumber: number[]): string {
    const checkSum = documentNumber
      .slice(0, 10)
      .reduce((previousResult: number, currentDigit: number, index: number) => {
        return currentDigit * (11 - index) + previousResult;
      }, 0);

    return String(this.generateDigitoVerificador(checkSum));
  }

  private generateDigitoVerificador(checkSum: number) {
    let digitoVerificador = (checkSum * 10) % 11;

    if (digitoVerificador === 10) {
      digitoVerificador = 0;
    }

    return digitoVerificador;
  }

  public toString(): string {
    if (this.isValid()) {
      return ''.concat(
        `${this.code.slice(0, 3)}.`,
        `${this.code.slice(3, 6)}.`,
        `${this.code.slice(6, 9)}-`,
        `${this.code.slice(9, 11)}`,
      )
    }

    return 'Invalid CPF number';
  }
}
