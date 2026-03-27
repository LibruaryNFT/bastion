declare module 'bn.js' {
  export default class BN {
    constructor(value?: string | number | BN);
    clone(): BN;
    add(b: BN): BN;
    sub(b: BN): BN;
    mul(b: BN): BN;
    div(b: BN): BN;
    mod(b: BN): BN;
    pow(b: BN): BN;
    toString(base?: number | 'hex'): string;
    toNumber(): number;
    cmp(b: BN): number;
    [key: string]: any;
  }
}
