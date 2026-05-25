'use client'

import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react'
import type { Category } from '@/lib/types'
import type { TransactionFilters, SortField, SortDirection } from '@/lib/hooks/useTransactions'

interface FilterBarProps {
  filters: TransactionFilters
  categories: Category[]
  onFilterChange: (filters: Partial<TransactionFilters>) => void
}

const SORT_OPTIONS: { label: string; field: SortField; direction: SortDirection }[] = [
  { label: 'Terbaru', field: 'date', direction: 'desc' },
  { label: 'Terlama', field: 'date', direction: 'asc' },
  { label: 'Nominal Terbesar', field: 'amount', direction: 'desc' },
  { label: 'Nominal Terkecil', field: 'amount', direction: 'asc' },
]

export function FilterBar({ filters, categories, onFilterChange }: FilterBarProps) {
  const hasActiveFilters =
    filters.search || filters.categoryId || filters.dateFrom || filters.dateTo

  const clearFilters = () => {
    onFilterChange({
      search: '',
      categoryId: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const activeSortLabel =
    SORT_OPTIONS.find(
      (opt) => opt.field === filters.sortField && opt.direction === filters.sortDirection
    )?.label || 'Terbaru'

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search size={18} className="filter-search-icon" />
        <input
          type="search"
          placeholder="Cari transaksi..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        {filters.search && (
          <button
            className="filter-clear"
            onClick={() => onFilterChange({ search: '' })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-options">
        <select
          className="filter-select"
          value={filters.categoryId}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="filter-date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
          placeholder="Dari"
        />
        <input
          type="date"
          className="filter-date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
          placeholder="Sampai"
        />

        <div className="sort-dropdown-wrapper">
          <button className="filter-sort-btn" title="Urutkan">
            <ArrowUpDown size={16} />
            <span className="sort-label">{activeSortLabel}</span>
          </button>
          <div className="sort-dropdown">
            {SORT_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                className={`sort-option ${
                  filters.sortField === opt.field && filters.sortDirection === opt.direction
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  onFilterChange({ sortField: opt.field, sortDirection: opt.direction })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearFilters}>
            <SlidersHorizontal size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
