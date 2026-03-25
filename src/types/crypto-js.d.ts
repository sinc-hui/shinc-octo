declare module 'crypto-js' {
  const CryptoJS: {
    AES: {
      encrypt(message: string, key: string): { toString(): string }
      decrypt(ciphertext: string, key: string): { toString(enc: unknown): string }
    }
    PBKDF2(
      password: string,
      salt: string,
      options: { keySize: number; iterations: number }
    ): { toString(): string }
    enc: {
      Utf8: unknown
    }
    lib: {
      WordArray: {
        random(nBytes: number): { toString(): string }
      }
    }
  }
  export default CryptoJS
}
