import CryptoJS from 'crypto-js'

/**
 * 端到端加密工具
 * 使用 AES 加密，密钥由用户主密码派生
 */

// 从主密码派生加密密钥
export function deriveKey(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString()
}

// 加密数据
export function encrypt(text: string, key: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, key).toString()
  return encrypted
}

// 解密数据
export function decrypt(encryptedText: string, key: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}

// 生成随机盐值
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString()
}

// 验证密码是否正确（通过尝试解密）
export function verifyPassword(testPassword: string, salt: string, encryptedSample: string): boolean {
  try {
    const key = deriveKey(testPassword, salt)
    const decrypted = decrypt(encryptedSample, key)
    return decrypted !== ''
  } catch {
    return false
  }
}
