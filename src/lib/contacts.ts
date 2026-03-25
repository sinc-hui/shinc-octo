import { supabase } from './supabase'
import { encrypt, decrypt } from './crypto'

export interface Contact {
  id: string
  user_id: string
  name_encrypted: string
  phone_encrypted: string | null
  email_encrypted: string | null
  title: string | null
  company: string | null
  industry: string | null
  city: string | null
  source: string | null
  tags: string[] | null
  notes_encrypted: string | null
  created_at: string
  updated_at: string
}

export interface ContactDecrypted {
  id: string
  name: string
  phone: string | null
  email: string | null
  title: string | null
  company: string | null
  industry: string | null
  city: string | null
  source: string | null
  tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Record {
  id: string
  contact_id: string
  type: string
  date: string
  emotion: string | null
  content_encrypted: string
  key_info_encrypted: string | null
  next_step_encrypted: string | null
  created_at: string
}

export interface Task {
  id: string
  contact_id: string
  content_encrypted: string
  due_date: string | null
  priority: string | null
  done: boolean
  created_at: string
}

// 解密联系人
export function decryptContact(contact: Contact, key: string): ContactDecrypted {
  return {
    ...contact,
    name: decrypt(contact.name_encrypted, key),
    phone: contact.phone_encrypted ? decrypt(contact.phone_encrypted, key) : null,
    email: contact.email_encrypted ? decrypt(contact.email_encrypted, key) : null,
    notes: contact.notes_encrypted ? decrypt(contact.notes_encrypted, key) : null,
  }
}

// 解密记录
export function decryptRecord(record: Record, key: string) {
  return {
    ...record,
    content: decrypt(record.content_encrypted, key),
    key_info: record.key_info_encrypted ? decrypt(record.key_info_encrypted, key) : null,
    next_step: record.next_step_encrypted ? decrypt(record.next_step_encrypted, key) : null,
  }
}

// 解密任务
export function decryptTask(task: Task, key: string) {
  return {
    ...task,
    content: decrypt(task.content_encrypted, key),
  }
}

// 获取所有联系人
export async function getContacts(userId: string, key: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return data?.map(c => decryptContact(c, key)) || []
}

// 创建联系人
export async function createContact(userId: string, contact: Partial<ContactDecrypted>, key: string) {
  const encryptedData = {
    user_id: userId,
    name_encrypted: encrypt(contact.name!, key),
    phone_encrypted: contact.phone ? encrypt(contact.phone, key) : null,
    email_encrypted: contact.email ? encrypt(contact.email, key) : null,
    title: contact.title || null,
    company: contact.company || null,
    industry: contact.industry || null,
    city: contact.city || null,
    source: contact.source || null,
    tags: contact.tags || [],
    notes_encrypted: contact.notes ? encrypt(contact.notes, key) : null,
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert(encryptedData)
    .select()
    .single()

  if (error) throw error

  return decryptContact(data, key)
}

// 更新联系人
export async function updateContact(id: string, contact: Partial<ContactDecrypted>, key: string) {
  const updates: any = {
    updated_at: new Date().toISOString(),
  }

  if (contact.name) updates.name_encrypted = encrypt(contact.name, key)
  if (contact.phone !== undefined) updates.phone_encrypted = contact.phone ? encrypt(contact.phone, key) : null
  if (contact.email !== undefined) updates.email_encrypted = contact.email ? encrypt(contact.email, key) : null
  if (contact.title !== undefined) updates.title = contact.title
  if (contact.company !== undefined) updates.company = contact.company
  if (contact.industry !== undefined) updates.industry = contact.industry
  if (contact.city !== undefined) updates.city = contact.city
  if (contact.source !== undefined) updates.source = contact.source
  if (contact.tags !== undefined) updates.tags = contact.tags
  if (contact.notes !== undefined) updates.notes_encrypted = contact.notes ? encrypt(contact.notes, key) : null

  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return decryptContact(data, key)
}

// 删除联系人
export async function deleteContact(id: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// 获取联系人的记录
export async function getRecords(contactId: string, key: string) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('contact_id', contactId)
    .order('date', { ascending: false })

  if (error) throw error

  return data?.map(r => decryptRecord(r, key)) || []
}

// 创建记录
export async function createRecord(contactId: string, record: any, key: string) {
  const { data, error } = await supabase
    .from('records')
    .insert({
      contact_id: contactId,
      type: record.type,
      date: record.date,
      emotion: record.emotion,
      content_encrypted: encrypt(record.content, key),
      key_info_encrypted: record.key_info ? encrypt(record.key_info, key) : null,
      next_step_encrypted: record.next_step ? encrypt(record.next_step, key) : null,
    })
    .select()
    .single()

  if (error) throw error

  return decryptRecord(data, key)
}

// 获取联系人的任务
export async function getTasks(contactId: string, key: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('contact_id', contactId)
    .order('due_date', { ascending: true })

  if (error) throw error

  return data?.map(t => decryptTask(t, key)) || []
}

// 创建任务
export async function createTask(contactId: string, task: any, key: string) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      contact_id: contactId,
      content_encrypted: encrypt(task.content, key),
      due_date: task.due_date || null,
      priority: task.priority,
      done: false,
    })
    .select()
    .single()

  if (error) throw error

  return decryptTask(data, key)
}

// 更新任务
export async function updateTask(id: string, updates: any) {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

// 删除任务
export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
