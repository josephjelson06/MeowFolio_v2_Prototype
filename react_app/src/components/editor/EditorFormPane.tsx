import { Pagination } from 'components/ui/Pagination';

interface EditorFormPaneProps {
  activeSection: string;
  items: string[];
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function EditorFormPane({
  activeSection,
  items,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: EditorFormPaneProps) {
  return (
    <div className="ra-stack-lg">
      <div className="ra-stack-sm">
        <h2 className="ra-card-title">{activeSection}</h2>
        <p className="ra-card-copy">The editor route is now page-local React state, with paged section detail items instead of one long static stack.</p>
      </div>

      <div className="ra-form-grid">
        {items.map(item => (
          <div className="ra-field" key={item}>
            <label>{item}</label>
            <textarea defaultValue={`${item} details for ${activeSection}.`} />
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPrev={onPrevPage} onNext={onNextPage} label={`${activeSection} pagination`} />
    </div>
  );
}
