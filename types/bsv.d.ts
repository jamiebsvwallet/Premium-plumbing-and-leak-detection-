declare module 'bsv' {
  export class PrivateKey {
    static fromWIF(wif: string): PrivateKey;
    toAddress(network?: any): Address;
  }

  export class Address {
    toString(): string;
  }

  export class Script {
    static buildSafeDataOut(data: string[]): Script;
    toHex(): string;
  }

  export const Networks: {
    mainnet: any;
    testnet: any;
  };
}
