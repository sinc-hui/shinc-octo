import { useState, useEffect } from 'react'
import { ContactDecrypted } from '../lib/contacts'
import { getRecords, getTasks, createRecord, createTask, deleteTask, updateTask } from '../lib/contacts'

export default function ContactDetail({ contact, onBack, password, user }: {
  contact: ContactDecrypted
  onBack: () => void
  password: string
  user: any
}) {
  const [records, setRecords] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'records' | 'tasks'>('records')

  // 记录表单
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState({
    type: 'call',
    date: new Date().toISOString().split('T')[0],
    emotion: 'good',
    content: '',
    key_info: '',
    next_step: '',
  })

  // 任务表单
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    content: '',
    due_date: '',
    priority: 'medium',
  })

  useEffect(() => {
    loadData()
  }, [contact.id])

  const loadData = async () => {
    const [recordsData, tasksData] = await Promise.all([
      getRecords(contact.id, password),
      getTasks(contact.id, password),
    ])
    setRecords(recordsData)
    setTasks(tasksData)
  }

  const handleAddRecord = async () => {
    try {
      await createRecord(contact.id, recordForm, password)
      setShowRecordModal(false)
      setRecordForm({
        type: 'call',
        date: new Date().toISOString().split('T')[0],
        emotion: 'good',
        content: '',
        key_info: '',
        next_step: '',
      })
      await loadData()
    } catch (error) {
      console.error('添加记录失败:', error)
      alert('添加失败，请重试')
    }
  }

  const handleAddTask = async () => {
    try {
      await createTask(contact.id, taskForm, password)
      setShowTaskModal(false)
      setTaskForm({
        content: '',
        due_date: '',
        priority: 'medium',
      })
      await loadData()
    } catch (error) {
      console.error('添加任务失败:', error)
      alert('添加失败，请重试')
    }
  }

  const handleToggleTask = async (taskId: string, done: boolean) => {
    try {
      await updateTask(taskId, { done: !done })
      await loadData()
    } catch (error) {
      console.error('更新任务失败:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('删除此任务？')) return

    try {
      await deleteTask(taskId)
      await loadData()
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  const emotionMap: any = {
    great: { icon: '😄', label: '非常顺利', color: 'bg-green-100 text-green-700' },
    good: { icon: '🙂', label: '还不错', color: 'bg-blue-100 text-blue-700' },
    neutral: { icon: '😐', label: '一般', color: 'bg-gray-100 text-gray-700' },
    awkward: { icon: '😅', label: '有点尬', color: 'bg-yellow-100 text-yellow-700' },
    bad: { icon: '😞', label: '不太好', color: 'bg-red-100 text-red-700' },
  }

  const typeMap: any = {
    call: { icon: '📞', label: '电话' },
    meeting: { icon: '🤝', label: '会面' },
    wechat: { icon: '💬', label: '微信' },
    email: { icon: '📧', label: '邮件' },
    work: { icon: '💼', label: '工作往来' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            ← 返回列表
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
            <p className="text-sm text-gray-500">
              {contact.title} {contact.company && `@ ${contact.company}`}
            </p>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 联系人信息 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {contact.phone && (
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span className="text-gray-700">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span className="text-gray-700">{contact.email}</span>
              </div>
            )}
            {contact.city && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span className="text-gray-700">{contact.city}</span>
              </div>
            )}
            {contact.source && (
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span className="text-gray-700">{contact.source}</span>
              </div>
            )}
          </div>

          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
              {contact.notes}
            </div>
          )}
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'records'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              沟通记录 ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'tasks'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              跟进任务 ({tasks.filter(t => !t.done).length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'records' ? (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowRecordModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    + 添加记录
                  </button>
                </div>

                {records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">💬</div>
                    <p>还没有沟通记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => {
                      const e = emotionMap[record.emotion] || emotionMap.good
                      const t = typeMap[record.type] || { icon: '💬', label: '沟通' }

                      return (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{t.icon}</span>
                              <span className="font-medium text-gray-900">{t.label}</span>
                              <span className="text-sm text-gray-500">{record.date}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${e.color}`}>
                                {e.icon} {e.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{record.content}</p>
                          {record.key_info && (
                            <div className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-900 mb-2">
                              🔑 关键信息：{record.key_info}
                            </div>
                          )}
                          {record.next_step && (
                            <div className="text-sm text-green-700">
                              ▶ 下一步：{record.next_step}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    + 添加任务
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">✅</div>
                    <p>还没有跟进任务</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 ${
                          task.done ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id, task.done)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                              task.done
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {task.done && '✓'}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {task.content}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>
                                {task.due_date ? `截止：${task.due_date}` : '无截止日期'}
                              </span>
                              <span>
                                {task.priority === 'high' ? '🔴 高' :
                                 task.priority === 'medium' ? '🟡 中' : '🟢 低'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 添加记录弹窗 */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">添加沟通记录</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  记录类型
                </label>
                <div className="flex gap-2">
                  {Object.entries(typeMap).map(([key, val]: any) => (
                    <button
                      key={key}
                      onClick={() => setRecordForm({ ...recordForm, type: key })}
                      className={`px-4 py-2 rounded-lg border transition ${
                        recordForm.type === key
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {val.icon} {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    value={recordForm.date}
                    onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    沟通氛围
                  </label>
                  <select
                    value={recordForm.emotion}
                    onChange={(e) => setRecordForm({ ...recordForm, emotion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(emotionMap).map(([key, val]: any) => (
                      <option key={key} value={key}>
                        {val.icon} {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  记录内容 *
                </label>
                <textarea
                  value={recordForm.content}
                  onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  关键信息
                </label>
                <input
                  type="text"
                  value={recordForm.key_info}
                  onChange={(e) => setRecordForm({ ...recordForm, key_info: e.target.value })}
                  placeholder="对方提到的重要事项..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  下一步行动
                </label>
                <input
                  type="text"
                  value={recordForm.next_step}
                  onChange={(e) => setRecordForm({ ...recordForm, next_step: e.target.value })}
                  placeholder="例如：三天后发方案..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                取消
              </button>
              <button
                onClick={handleAddRecord}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加任务弹窗 */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">添加跟进任务</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  任务内容 *
                </label>
                <input
                  type="text"
                  value={taskForm.content}
                  onChange={(e) => setTaskForm({ ...taskForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    优先级
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">🔴 高优先级</option>
                    <option value="medium">🟡 中优先级</option>
                    <option value="low">🟢 低优先级</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
