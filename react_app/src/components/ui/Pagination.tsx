import { Button } from 'components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
}

export function Pagination({ page, totalPages, onPrev, onNext, label = 'Pagination' }: PaginationProps) {
  return (
    <div className="ra-pagination" aria-label={label}>
      <span className="section-label">Page {page} of {totalPages}</span>
      <div className="ra-actions">
        <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>Previous</Button>
        <Button variant="primary" onClick={onNext} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  );
}
