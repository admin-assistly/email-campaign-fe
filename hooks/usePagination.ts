// Custom hook for pagination with search and sorting
import { useState, useCallback, useMemo } from 'react';
import type { PaginationParams, PaginatedResponse } from '@/lib/types';

interface UsePaginationOptions<T> {
  data: T[];
  initialPage?: number;
  initialLimit?: number;
  searchableFields?: (keyof T)[];
  sortableFields?: (keyof T)[];
  defaultSortBy?: keyof T;
  defaultSortOrder?: 'asc' | 'desc';
}

export function usePagination<T>({
  data,
  initialPage = 1,
  initialLimit = 10,
  searchableFields = [],
  sortableFields = [],
  defaultSortBy,
  defaultSortOrder = 'asc'
}: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | undefined>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search || searchableFields.length === 0) {
      return data;
    }

    const searchLower = search.toLowerCase();
    return data.filter(item =>
      searchableFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, search, searchableFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      // Default string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortOrder]);

  // Calculate pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  const clearSearch = useCallback(() => {
    setSearch('');
    setCurrentPage(1);
  }, []);

  const toggleSort = useCallback((field: keyof T) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortBy, sortOrder]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setLimit(initialLimit);
    setSearch('');
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
  }, [initialPage, initialLimit, defaultSortBy, defaultSortOrder]);

  // Get pagination info
  const paginationInfo = useMemo(() => ({
    currentPage,
    limit,
    totalItems,
    totalPages,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, totalItems),
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  }), [currentPage, limit, totalItems, totalPages, startIndex, endIndex]);

  // Get pagination params for API calls
  const paginationParams: PaginationParams = useMemo(() => ({
    page: currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
  }), [currentPage, limit, search, sortBy, sortOrder]);

  // Get page numbers for display
  const getPageNumbers = useCallback((maxVisible: number = 5) => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > halfVisible + 1) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - halfVisible);
      const end = Math.min(totalPages - 1, currentPage + halfVisible);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - halfVisible) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // Data
    currentData,
    filteredData,
    sortedData,
    
    // Pagination state
    currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
    
    // Pagination info
    paginationInfo,
    paginationParams,
    
    // Navigation functions
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    changeLimit,
    
    // Search and sort functions
    setSearch,
    clearSearch,
    toggleSort,
    
    // Utility functions
    reset,
    getPageNumbers,
  };
}

// Hook for server-side pagination
export function useServerPagination<T>(
  initialParams: PaginationParams = { page: 1, limit: 10 }
) {
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalItems / params.limit);

  const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 })); // Reset to first page
  }, []);

  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setParams(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const toggleSort = useCallback((sortBy: string) => {
    setParams(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  }, []);

  const reset = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  return {
    // State
    params,
    data,
    totalItems,
    totalPages,
    loading,
    error,
    
    // Actions
    setData,
    setTotalItems,
    setLoading,
    setError,
    updateParams,
    goToPage,
    changeLimit,
    setSearch,
    toggleSort,
    reset,
  };
}
