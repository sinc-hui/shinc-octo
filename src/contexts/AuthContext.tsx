import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { deriveKey, generateSalt } from '../lib/crypto'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  password: string | null
  isPasswordSet: boolean
  signUp: (email: string, password: string, masterPassword: string) => Promise<void>
  signIn: (email: string, password: string, masterPassword: string) => Promise<void>
  signOut: () => Promise<void>
  setPassword: (masterPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPasswordState] = useState<string | null>(null)

  // 检查用户是否已设置加密密码
  const isPasswordSet = password !== null

  // 初始化：检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
        // 从 localStorage 恢复加密密码（生产环境应使用更安全的方式）
        const savedPassword = localStorage.getItem('master_password')
        if (savedPassword) {
          setPasswordState(savedPassword)
        }
      }

      setLoading(false)

      // 监听认证状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' })
          } else {
            setUser(null)
            setPasswordState(null)
            localStorage.removeItem('master_password')
          }
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }

    initAuth()
  }, [])

  // 注册（邮箱 + 主密码）
  const signUp = async (email: string, password: string, masterPassword: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      // 创建用户 profile，保存加密密钥
      const salt = generateSalt()
      const encryptedKey = deriveKey(masterPassword, salt)

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, encrypted_key: encryptedKey })

      if (profileError) {
        console.error('Failed to create profile:', profileError)
      }

      setUser({ id: data.user.id, email })
      setPasswordState(masterPassword)
      localStorage.setItem('master_password', masterPassword)
    }
  }

  // 登录
  const signIn = async (email: string, password: string, masterPassword: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      setUser({ id: data.user.id, email })
      setPasswordState(masterPassword)
      localStorage.setItem('master_password', masterPassword)
    }
  }

  // 设置主密码（用于已登录但未设置密码的用户）
  const setPassword = async (masterPassword: string) => {
    if (!user) throw new Error('User not logged in')

    const salt = generateSalt()
    const encryptedKey = deriveKey(masterPassword, salt)

    const { error } = await supabase
      .from('profiles')
      .update({ encrypted_key: encryptedKey })
      .eq('id', user.id)

    if (error) throw error

    setPasswordState(masterPassword)
    localStorage.setItem('master_password', masterPassword)
  }

  // 登出
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPasswordState(null)
    localStorage.removeItem('master_password')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      password,
      isPasswordSet,
      signUp,
      signIn,
      signOut,
      setPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
