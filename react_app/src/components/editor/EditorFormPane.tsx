interface EditorFormPaneProps {
  activeSection: string;
  items: string[];
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

function renderContactSection() {
  return (
    <>
      <div className="fl">Full name</div><input className="fi" defaultValue="Arjun Kumar" />
      <div className="fl editor-field-gap">Email</div><input className="fi" defaultValue="arjun@email.com" />
      <div className="fl editor-field-gap">Phone</div><input className="fi" defaultValue="+91 98765 43210" />
      <div className="fl editor-field-gap">Location</div><input className="fi" defaultValue="Karnal, Haryana" />
      <div className="fl editor-field-gap">LinkedIn</div><input className="fi" defaultValue="linkedin.com/in/arjun" />
    </>
  );
}

function renderSummarySection() {
  return (
    <>
      <div className="fl">Professional summary</div>
      <textarea className="fi editor-ta-md" defaultValue="Software engineer with 3 years of experience in full-stack development..." />
    </>
  );
}

function renderDetailSection(activeSection: string, items: string[]) {
  return (
    <>
      {items.map((item, index) => (
        <div key={`${activeSection}-${item}-${index}`}>
          {activeSection === 'exp' ? (
            <>
              <div className="fl">Company</div><input className="fi" defaultValue={`Company ${index + 1}`} />
              <div className="fl editor-field-gap">Role</div><input className="fi" defaultValue="Software Engineer" />
              <div className="fl editor-field-gap">Duration</div><input className="fi" defaultValue="Jun 2022 - Present" />
              <div className="fl editor-field-gap">Bullets</div>
              <textarea className="fi editor-ta-sm" defaultValue={`Built ${item}\nReduced latency by 40%`}></textarea>
            </>
          ) : activeSection === 'edu' ? (
            <>
              <div className="fl">Institution</div><input className="fi" defaultValue={`Institute ${index + 1}`} />
              <div className="fl editor-field-gap">Degree</div><input className="fi" defaultValue="B.Tech Computer Science" />
              <div className="fl editor-field-gap">Year</div><input className="fi" defaultValue="2018 - 2022" />
            </>
          ) : activeSection === 'skills' ? (
            <>
              <div className="fl">Skill group</div>
              <textarea className="fi editor-ta-sm" defaultValue={`Python, React, Node.js, AWS, Docker (${index + 1})`}></textarea>
            </>
          ) : (
            <>
              <div className="fl">Project name</div><input className="fi" defaultValue={`Project ${index + 1}`} />
              <div className="fl editor-field-gap">Description</div>
              <textarea className="fi editor-ta-sm" defaultValue={`What did you build in ${item}?`}></textarea>
            </>
          )}
          {index < items.length - 1 ? <div className="editor-field-gap"></div> : null}
        </div>
      ))}
      <button className="fi-add" type="button">+ Add {activeSection === 'exp' ? 'experience' : activeSection === 'edu' ? 'education' : activeSection === 'skills' ? 'skills group' : 'project'}</button>
    </>
  );
}

export function EditorFormPane({
  activeSection,
  items,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: EditorFormPaneProps) {
  const needsPagination = ['exp', 'edu', 'skills', 'proj'].includes(activeSection);

  return (
    <div className="form-area">
      {activeSection === 'contact' ? renderContactSection() : null}
      {activeSection === 'summary' ? renderSummarySection() : null}
      {needsPagination ? renderDetailSection(activeSection, items) : null}

      {needsPagination ? (
        <div className="list-pagination">
          <div className="page-status">Page {page} of {totalPages}</div>
          <div className="page-controls">
            <button className="r-action" type="button" onClick={onPrevPage} disabled={page === 1}>Previous</button>
            <button className="r-action" type="button" onClick={onNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
