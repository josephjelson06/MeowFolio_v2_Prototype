import { useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize],
  );

  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function next() {
    setPage(current => Math.min(totalPages, current + 1));
  }

  function prev() {
    setPage(current => Math.max(1, current - 1));
  }

  function reset() {
    setPage(1);
  }

  return { page, setPage, totalPages, currentItems, next, prev, reset };
}
