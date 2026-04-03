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
    <div className="flex flex-wrap items-center justify-between gap-3" aria-label={label}>
      <span className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">Page {page} of {totalPages}</span>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>Previous</Button>
        <Button variant="primary" onClick={onNext} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  );
}
