'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { CategoryList } from '@/components/master/CategoryList'
import { CategoryForm } from '@/components/master/CategoryForm'
import { useCategories } from '@/lib/hooks/useCategories'
import type { Category } from '@/lib/types'
import { Plus } from 'lucide-react'
import '@/styles/master.css'

type TabType = 'income' | 'outcome'

export default function MasterPage() {
  const [tab, setTab] = useState<TabType>('outcome')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    toggleCategory,
    deleteCategory,
  } = useCategories()

  const filteredCategories = categories.filter((cat) => cat.type === tab)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingCategory(null)
  }

  const handleSave = async (data: {
    name: string
    type: 'income' | 'outcome'
    icon: string
    color: string
  }) => {
    return addCategory(data)
  }

  const handleUpdate = async (
    id: string,
    data: { name: string; icon: string; color: string }
  ) => {
    return updateCategory(id, data)
  }

  return (
    <AppShell>
      <div className="master-page">
        <div className="master-header">
          <h1>Data Master</h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingCategory(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>

        <div className="tab-toggle">
          <button
            className={`tab-btn ${tab === 'outcome' ? 'active' : ''}`}
            onClick={() => setTab('outcome')}
          >
            Pengeluaran
          </button>
          <button
            className={`tab-btn ${tab === 'income' ? 'active' : ''}`}
            onClick={() => setTab('income')}
          >
            Pemasukan
          </button>
        </div>

        <CategoryList
          categories={filteredCategories}
          loading={loading}
          onToggle={toggleCategory}
          onEdit={handleEdit}
          onDelete={deleteCategory}
          onAddClick={() => {
            setEditingCategory(null)
            setFormOpen(true)
          }}
        />

        <CategoryForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
          onUpdate={handleUpdate}
          type={tab}
          category={editingCategory}
        />
      </div>
    </AppShell>
  )
}
