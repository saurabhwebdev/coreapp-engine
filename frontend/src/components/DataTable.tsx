import { useState, useMemo } from 'react';
import { Table, Input, Select, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ExpandableConfig } from 'antd/es/table/interface';

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  dataSource: T[];
  columns: ColumnsType<T>;
  rowKey: string | ((record: T) => string);
  loading?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[]; // fields to search in
  filters?: FilterOption[];
  pageSize?: number;
  showSearch?: boolean;
  showPagination?: boolean;
  compact?: boolean;
  toolbar?: React.ReactNode; // extra toolbar content on the right
  pagination?: TablePaginationConfig | false; // external pagination override (e.g. server-side)
  onRow?: (record: T) => React.HTMLAttributes<HTMLElement>;
  size?: 'small' | 'middle' | 'large';
  expandable?: ExpandableConfig<T>;
}

export default function DataTable<T extends Record<string, any>>({
  dataSource,
  columns,
  rowKey,
  loading = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  filters = [],
  pageSize = 10,
  showSearch = true,
  showPagination = true,
  compact = false,
  toolbar,
  pagination: paginationOverride,
  onRow,
  size,
  expandable,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Client-side search
  const filtered = useMemo(() => {
    let data = dataSource;

    // Text search
    if (search.trim() && searchFields.length > 0) {
      const q = search.toLowerCase();
      data = data.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Dropdown filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value) {
        data = data.filter((item) => String(item[key]) === value);
      }
    }

    return data;
  }, [dataSource, search, searchFields, filterValues]);

  const hasToolbar = showSearch || filters.length > 0 || toolbar;

  const pagination: TablePaginationConfig | false = paginationOverride !== undefined
    ? paginationOverride
    : showPagination
      ? {
          current: page,
          pageSize,
          total: filtered.length,
          onChange: setPage,
          size: 'small',
          showTotal: (total) => (
            <span style={{ fontSize: 12, color: 'var(--ce-text-muted)' }}>
              {total} record{total !== 1 ? 's' : ''}
            </span>
          ),
        }
      : false;

  return (
    <div>
      {hasToolbar && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            {showSearch && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined style={{ color: 'var(--ce-text-muted)', fontSize: 13 }} />}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                allowClear
                size={compact ? 'small' : 'middle'}
                style={{ maxWidth: 280 }}
              />
            )}
            {filters.length > 0 && (
              <Space size={6}>
                {filters.map((f) => (
                  <Select
                    key={f.key}
                    placeholder={f.label}
                    allowClear
                    size={compact ? 'small' : 'middle'}
                    style={{ minWidth: 120 }}
                    value={filterValues[f.key] || undefined}
                    onChange={(v) => { setFilterValues((prev) => ({ ...prev, [f.key]: v || '' })); setPage(1); }}
                    options={f.options}
                    suffixIcon={<FilterOutlined style={{ fontSize: 11, color: 'var(--ce-text-muted)' }} />}
                  />
                ))}
              </Space>
            )}
            {filtered.length !== dataSource.length && (
              <span style={{ fontSize: 11, color: 'var(--ce-text-muted)', flexShrink: 0 }}>
                {filtered.length} of {dataSource.length}
              </span>
            )}
          </div>
          {toolbar && (
            <div style={{ flexShrink: 0 }}>{toolbar}</div>
          )}
        </div>
      )}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        size={size ?? (compact ? 'small' : 'middle')}
        pagination={pagination}
        onRow={onRow}
        expandable={expandable}
      />
    </div>
  );
}
