import type { JdRecord } from 'types/jd';
import { Button } from 'components/ui/Button';

interface JdListPaneProps {
  items: JdRecord[];
  activeId: number | null;
  totalCount: number;
  page: number;
  totalPages: number;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRename: (id: number) => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}

export function JdListPane({
  items,
  activeId,
  totalCount,
  page,
  totalPages,
  onSelect,
  onAdd,
  onPrev,
  onNext,
  onRename,
  onDownload,
  onDelete,
}: JdListPaneProps) {
  return (
    <section className="jd-list-pane">
      <div className="jd-list-head">
        <div>
          <div className="jd-list-title">Saved JDs</div>
          <div className="page-status jd-count-status">{totalCount} JDs</div>
        </div>
        <Button className="jd-add-btn" onClick={onAdd}>+ Add JD</Button>
      </div>

      <div className="jd-cards">
        {items.length ? (
          items.map(item => (
            <article
              key={item.id}
              className={`jd-card${activeId === item.id ? ' active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <div className="jd-card-title">{item.title}</div>
              <div className="jd-card-sub">{item.company} &middot; {item.type}</div>
              <div className="jd-card-foot">
                <span className="jd-card-badge">{item.badge}</span>
                <div className="jd-card-actions">
                  <button className="r-action" type="button" onClick={event => {
                    event.stopPropagation();
                    onRename(item.id);
                  }}>
                    Rename
                  </button>
                  <button className="r-action" type="button" onClick={event => {
                    event.stopPropagation();
                    onDownload(item.id);
                  }}>
                    &#11015;
                  </button>
                  <button className="r-action jd-delete-action" type="button" onClick={event => {
                    event.stopPropagation();
                    onDelete(item.id);
                  }}>
                    &#128465;
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="jd-no-result">
            <div className="jd-no-result-icon">&#9678;</div>
            <div className="jd-no-result-txt">No saved JDs yet. Add one to begin matching.</div>
          </div>
        )}
      </div>

      <div className="list-pagination jd-pagination">
        <div className="page-status">Page {page} of {totalPages}</div>
        <div className="page-controls">
          <button className="r-action" type="button" onClick={onPrev} disabled={page === 1}>Previous</button>
          <button className="r-action" type="button" onClick={onNext} disabled={page === totalPages}>Next</button>
        </div>
      </div>
    </section>
  );
}
