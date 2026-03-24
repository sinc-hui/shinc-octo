-- ============================================
-- 个人 CRM 数据库初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- ============================================

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建 profiles 表（用户扩展信息）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  encrypted_key TEXT,  -- 存储用户派生的加密密钥
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建 contacts 表
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name_encrypted TEXT NOT NULL,
  phone_encrypted TEXT,
  email_encrypted TEXT,
  title TEXT,
  company TEXT,
  industry TEXT,
  city TEXT,
  source TEXT,
  tags TEXT[],
  notes_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建 records 表
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'meeting', 'wechat', 'email', 'work')),
  date DATE NOT NULL,
  emotion TEXT CHECK (emotion IN ('great', 'good', 'neutral', 'awkward', 'bad')),
  content_encrypted TEXT NOT NULL,
  key_info_encrypted TEXT,
  next_step_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 创建 tasks 表
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  content_encrypted TEXT NOT NULL,
  due_date DATE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 启用行级安全（RLS）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 安全策略
-- ============================================

-- profiles 表策略
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- contacts 表策略
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.contacts FOR DELETE
  USING (auth.uid() = user_id);

-- records 表策略（通过联系人关联）
CREATE POLICY "Users can view their own records"
  ON public.records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = records.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own records"
  ON public.records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = records.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own records"
  ON public.records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = records.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own records"
  ON public.records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = records.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- tasks 表策略（通过联系人关联）
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = tasks.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = tasks.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = tasks.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts
      WHERE contacts.id = tasks.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- 7. 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_records_contact_id ON public.records(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING GIN(tags);

-- 8. 创建自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成提示
-- ============================================
-- 执行完成后，请：
-- 1. 进入 Supabase Dashboard -> Authentication
-- 2. 在 Email Auth 中启用 Email/Password 注册和登录
-- 3. 如需微信登录，需在 Authentication -> Providers 中配置微信
-- ============================================
