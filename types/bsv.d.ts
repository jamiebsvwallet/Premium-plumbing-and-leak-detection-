declare module 'bsv' {
  export class PrivateKey {
    static fromWIF(wif: string): PrivateKey;
    toAddress(network?: any): Address;
  }

  export class Address {
    toString(): string;
  }

  export class Script {
    static buildSafeDataOut(data: Buffer[]): Script;
  }

  export class Transaction {
    constructor();
    addOutput(output: Transaction.Output): Transaction;
    from(utxos: any[]): Transaction;
    toString(): string;

    static Output: typeof Output;
  }

  export class Output {
    constructor(params: { script: Script; satoshis: number });
  }

  export namespace Networks {
    export const mainnet: any;
    export const testnet: any;
  }
}
