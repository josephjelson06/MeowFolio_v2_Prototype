import { useEffect, useState, useMemo } from 'react';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { trackerService } from 'services/tracker/trackerService';
import { ModalShell } from 'components/ui/ModalShell';
import type { JobApplication, OutreachContact } from 'types/tracker';
import { cn } from 'lib/cn';

// UI Action Button Helper (mimicking ProfileAction style)
function TrackerButton({
  children,
  className,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'tab' | 'tab-active';
  disabled?: boolean;
}) {
  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-50 disabled:pointer-events-none';

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile px-5 py-2.5 text-xs';
  } else if (variant === 'secondary') {
    variantClass = 'bg-white/85 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile px-4 py-2 text-xs';
  } else if (variant === 'danger') {
    variantClass = 'border-error bg-error-container text-error px-4 py-2 text-xs';
  } else if (variant === 'tab') {
    variantClass = 'border-transparent bg-transparent shadow-none hover:text-primary hover:bg-white/30 px-5 py-2 text-sm';
  } else if (variant === 'tab-active') {
    variantClass = 'bg-white text-on-surface shadow-tactile-sm px-5 py-2 text-sm';
  }

  return (
    <button
      className={cn(baseClass, variantClass, className)}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Helper to style status badges dynamically
function getStatusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes('reject')) {
    return 'border-error/45 bg-error-container/70 text-error';
  } else if (s.includes('interview')) {
    return 'border-secondary/45 bg-secondary-fixed text-secondary';
  } else if (s.includes('offer')) {
    return 'border-tertiary/45 bg-tertiary-fixed text-tertiary';
  } else if (s.includes('schedule') || s.includes('soon') || s.includes('accepted')) {
    return 'border-[color:var(--warn)]/45 bg-[color:var(--warn-bg)] text-[color:var(--warn)]';
  } else {
    // Applied, message sent, pending etc.
    return 'border-charcoal/30 bg-surface-container text-[color:var(--txt1)]';
  }
}

export function TrackerPage() {
  const [tab, setTab] = useState<'applications' | 'outreach'>('applications');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [outreaches, setOutreaches] = useState<OutreachContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [appPage, setAppPage] = useState(1);
  const [outreachPage, setOutreachPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setAppPage(1);
    setOutreachPage(1);
  }, [searchQuery, statusFilter]);

  // Sorting State
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal State
  const [activeModal, setActiveModal] = useState<{
    type: 'add_app' | 'edit_app' | 'add_outreach' | 'edit_outreach' | null;
    data?: any;
  }>({ type: null });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, outs] = await Promise.all([
        trackerService.listApplications(),
        trackerService.listOutreaches(),
      ]);
      setApplications(apps);
      setOutreaches(outs);
    } catch (err) {
      console.error('Failed to load trackers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Unique status list for filter dropdowns
  const applicationStatuses = useMemo(() => {
    const statuses = new Set<string>();
    applications.forEach(a => {
      if (a.status) statuses.add(a.status);
    });
    return Array.from(statuses);
  }, [applications]);

  const outreachStatuses = useMemo(() => {
    const statuses = new Set<string>();
    outreaches.forEach(o => {
      if (o.status) statuses.add(o.status);
    });
    return Array.from(statuses);
  }, [outreaches]);

  // Statistics Computations
  const appStats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter(a => a.status?.toLowerCase().includes('applied') || a.status === '').length;
    const interviews = applications.filter(a => a.status?.toLowerCase().includes('interview')).length;
    const rejected = applications.filter(a => a.status?.toLowerCase().includes('reject')).length;
    const reachoutYes = applications.filter(a => a.reachout?.toLowerCase() === 'yes').length;

    return { total, applied, interviews, rejected, reachoutYes };
  }, [applications]);

  const outreachStats = useMemo(() => {
    const total = outreaches.length;
    const accepted = outreaches.filter(o => o.status?.toLowerCase().includes('accepted')).length;
    const pending = total - accepted;

    return { total, accepted, pending };
  }, [outreaches]);

  // Handle sorting click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered and Sorted Applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(a => a.status === statusFilter);
    }

    // Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.company?.toLowerCase().includes(q) ||
          a.job_role?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q) ||
          a.source?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a: any, b: any) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, statusFilter, searchQuery, sortField, sortOrder]);

  // Filtered and Sorted Outreaches
  const filteredOutreaches = useMemo(() => {
    let result = [...outreaches];

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        o =>
          o.person?.toLowerCase().includes(q) ||
          o.company?.toLowerCase().includes(q) ||
          o.role?.toLowerCase().includes(q) ||
          o.medium?.toLowerCase().includes(q) ||
          o.contact?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a: any, b: any) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [outreaches, statusFilter, searchQuery, sortField, sortOrder]);

  // Paginated Applications
  const paginatedApplications = useMemo(() => {
    const start = (appPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, appPage]);

  // Paginated Outreaches
  const paginatedOutreaches = useMemo(() => {
    const start = (outreachPage - 1) * ITEMS_PER_PAGE;
    return filteredOutreaches.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOutreaches, outreachPage]);

  // Total pages
  const appTotalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const outreachTotalPages = Math.ceil(filteredOutreaches.length / ITEMS_PER_PAGE);

  // CRUD Actions
  const handleSaveApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const appData: Partial<JobApplication> = {
      job_role: formData.get('job_role') as string,
      company: formData.get('company') as string,
      date: formData.get('date') as string,
      source: formData.get('source') as string,
      method: formData.get('method') as string,
      status: formData.get('status') as string,
      recency: formData.get('recency') as string,
      experience: formData.get('experience') as string,
      done_via: formData.get('done_via') as string,
      notes: formData.get('notes') as string,
      reachout: formData.get('reachout') === 'yes' ? 'Yes' : '',
    };

    if (activeModal.type === 'edit_app') {
      appData.id = activeModal.data.id;
    }

    try {
      await trackerService.saveApplication(appData);
      setActiveModal({ type: null });
      void loadData();
    } catch (err) {
      alert('Failed to save application');
    }
  };

  const handleSaveOutreach = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const outreachData: Partial<OutreachContact> = {
      person: formData.get('person') as string,
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      date: formData.get('date') as string,
      medium: formData.get('medium') as string,
      contact: formData.get('contact') as string,
      contact2: formData.get('contact2') as string,
      status: formData.get('status') as string,
    };

    if (activeModal.type === 'edit_outreach') {
      outreachData.id = activeModal.data.id;
    }

    try {
      await trackerService.saveOutreach(outreachData);
      setActiveModal({ type: null });
      void loadData();
    } catch (err) {
      alert('Failed to save outreach contact');
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (confirm('Are you sure you want to delete this job application record?')) {
      try {
        await trackerService.deleteApplication(id);
        void loadData();
      } catch (err) {
        alert('Failed to delete application');
      }
    }
  };

  const handleDeleteOutreach = async (id: string) => {
    if (confirm('Are you sure you want to delete this outreach record?')) {
      try {
        await trackerService.deleteOutreach(id);
        void loadData();
      } catch (err) {
        alert('Failed to delete outreach contact');
      }
    }
  };

  return (
    <WorkspaceShell title="Tracker">
      <div className="grid gap-6">
        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">JOB HUNT HUB</div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">Application &amp; Outreach Trackers</h1>
          </div>

          {/* Unified Tab Selector */}
          <div className="flex items-center gap-1 self-start rounded-full border border-charcoal/10 bg-surface-container-low p-1">
            <TrackerButton
              variant={tab === 'applications' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('applications');
                setStatusFilter('All');
                setSortField('date');
                setSortOrder('desc');
              }}
            >
              💼 Applications
            </TrackerButton>
            <TrackerButton
              variant={tab === 'outreach' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('outreach');
                setStatusFilter('All');
                setSortField('date');
                setSortOrder('desc');
              }}
            >
              ✉ Outreach Contacts
            </TrackerButton>
          </div>
        </div>

        {/* Statistics Cards Row */}
        {tab === 'applications' ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5" aria-label="Applications Summary Statistics">
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Total Apps</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-on-surface">{appStats.total}</div>
            </div>
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Active Applied</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-tertiary">{appStats.applied}</div>
            </div>
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Interviews</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-secondary">{appStats.interviews}</div>
            </div>
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Rejected</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-error">{appStats.rejected}</div>
            </div>
            <div className="col-span-2 rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm md:col-span-1">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Reachouts Done</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-primary">{appStats.reachoutYes}</div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-3 gap-4" aria-label="Outreaches Summary Statistics">
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Total Outreach</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-on-surface">{outreachStats.total}</div>
            </div>
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Accepted Conn.</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-tertiary">{outreachStats.accepted}</div>
            </div>
            <div className="rounded-[1.5rem] border-[1.5px] border-charcoal bg-white p-4 shadow-tactile-sm">
              <div className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Pending Contacts</div>
              <div className="mt-1 font-headline text-3xl font-extrabold text-secondary">{outreachStats.pending}</div>
            </div>
          </section>
        )}

        {/* Filter and Add Button Row */}
        <section className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white/80 p-4 shadow-tactile-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                className="w-full rounded-full border-[1.5px] border-charcoal bg-white px-4 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/40 transition focus:border-primary focus:shadow-tactile"
                type="text"
                placeholder={tab === 'applications' ? 'Search by role, company, source...' : 'Search by person, company, status, medium...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[color:var(--txt2)]">Status:</span>
              <select
                className="rounded-full border-[1.5px] border-charcoal bg-white px-4 py-2 font-headline text-xs font-bold shadow-tactile-sm focus:border-primary"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {tab === 'applications'
                  ? applicationStatuses.map(s => <option key={s} value={s}>{s || 'None'}</option>)
                  : outreachStatuses.map(s => <option key={s} value={s}>{s || 'None'}</option>)}
              </select>
            </div>
          </div>

          <TrackerButton
            variant="primary"
            onClick={() => setActiveModal({ type: tab === 'applications' ? 'add_app' : 'add_outreach' })}
          >
            {tab === 'applications' ? '+ Add Application' : '+ Add Contact'}
          </TrackerButton>
        </section>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-[color:var(--txt1)]">Loading tracker records...</div>
        ) : (
          /* Table Section */
          <section className="grid">
            {tab === 'applications' ? (
              <div className="overflow-x-auto rounded-[1.75rem] border-[1.5px] border-charcoal bg-white shadow-tactile">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-[1.5px] border-charcoal bg-surface-container-low font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      <th className="px-4 py-3">Sr. No.</th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('date')}>
                        Date {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('job_role')}>
                        Job Role {sortField === 'job_role' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('company')}>
                        Company {sortField === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('status')}>
                        Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3">Recency</th>
                      <th className="px-4 py-3">Exp</th>
                      <th className="px-4 py-3">Done Via</th>
                      <th className="px-4 py-3 max-w-[200px]">Notes</th>
                      <th className="px-4 py-3 text-center">Reachout</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10 font-medium text-on-surface">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-sm font-bold text-[color:var(--txt2)]">
                          No matching applications found.
                        </td>
                      </tr>
                    ) : (
                      paginatedApplications.map((app, index) => {
                        const srNo = (appPage - 1) * ITEMS_PER_PAGE + index + 1;
                        return (
                          <tr key={app.id} className="transition hover:bg-surface-container-low/40">
                            <td className="px-4 py-3.5 text-center font-bold text-[color:var(--txt2)]">{srNo}</td>
                            <td className="whitespace-nowrap px-4 py-3.5">{app.date}</td>
                            <td className="px-4 py-3.5 font-bold">{app.job_role}</td>
                            <td className="px-4 py-3.5 font-bold text-primary">{app.company}</td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{app.source}</td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{app.method}</td>
                            <td className="px-4 py-3.5">
                              <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 font-headline text-[9px] font-bold uppercase tracking-wider', getStatusBadgeClass(app.status))}>
                                {app.status || 'Applied'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{app.recency || '-'}</td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{app.experience || '-'}</td>
                            <td className="px-4 py-3.5">
                              <span className="rounded bg-surface-container px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary border border-charcoal/10">
                                {app.done_via}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 max-w-[200px] truncate text-[color:var(--txt1)]" title={app.notes}>
                              {app.notes || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {app.reachout?.toLowerCase() === 'yes' ? (
                                <span className="inline-flex size-5 items-center justify-center rounded-full border border-tertiary/40 bg-tertiary-fixed font-headline text-[10px] font-bold text-tertiary" title="Reachout Completed">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-charcoal/20">-</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-center">
                              <div className="inline-flex gap-1.5">
                                <button
                                  className="font-headline text-[10px] font-bold uppercase tracking-wider text-secondary hover:underline"
                                  onClick={() => setActiveModal({ type: 'edit_app', data: app })}
                                >
                                  Edit
                                </button>
                                <span className="text-charcoal/20">|</span>
                                <button
                                  className="font-headline text-[10px] font-bold uppercase tracking-wider text-error hover:underline"
                                  onClick={() => handleDeleteApp(app.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredApplications.length > 0 && (
                  <div className="flex flex-col items-center justify-between gap-4 border-t border-charcoal/10 bg-surface-container-low/30 px-6 py-4 sm:flex-row">
                    <div className="text-xs font-bold text-[color:var(--txt2)]">
                      Showing {Math.min(filteredApplications.length, (appPage - 1) * ITEMS_PER_PAGE + 1)} to{' '}
                      {Math.min(filteredApplications.length, appPage * ITEMS_PER_PAGE)} of{' '}
                      {filteredApplications.length} entries
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setAppPage(1)}
                        disabled={appPage === 1}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        &laquo; First
                      </TrackerButton>
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setAppPage(appPage - 1)}
                        disabled={appPage === 1}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        &lsaquo; Prev
                      </TrackerButton>

                      {Array.from({ length: appTotalPages }).map((_, i) => {
                        const p = i + 1;
                        const isActive = appPage === p;
                        return (
                          <TrackerButton
                            key={p}
                            variant={isActive ? 'primary' : 'secondary'}
                            onClick={() => setAppPage(p)}
                            className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                          >
                            {p}
                          </TrackerButton>
                        );
                      })}

                      <TrackerButton
                        variant="secondary"
                        onClick={() => setAppPage(appPage + 1)}
                        disabled={appPage === appTotalPages}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        Next &rsaquo;
                      </TrackerButton>
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setAppPage(appTotalPages)}
                        disabled={appPage === appTotalPages}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        Last &raquo;
                      </TrackerButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[1.75rem] border-[1.5px] border-charcoal bg-white shadow-tactile">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-[1.5px] border-charcoal bg-surface-container-low font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      <th className="px-4 py-3">Sr. No.</th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('date')}>
                        Date {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('person')}>
                        Person {sortField === 'person' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('role')}>
                        Role {sortField === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('company')}>
                        Company {sortField === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3">Medium</th>
                      <th className="px-4 py-3 max-w-[200px]">Contact Info</th>
                      <th className="px-4 py-3">Alt Contact</th>
                      <th className="cursor-pointer px-4 py-3 hover:text-on-surface" onClick={() => handleSort('status')}>
                        Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10 font-medium text-on-surface">
                    {filteredOutreaches.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-sm font-bold text-[color:var(--txt2)]">
                          No matching outreach records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedOutreaches.map((out, index) => {
                        const srNo = (outreachPage - 1) * ITEMS_PER_PAGE + index + 1;
                        return (
                          <tr key={out.id} className="transition hover:bg-surface-container-low/40">
                            <td className="px-4 py-3.5 text-center font-bold text-[color:var(--txt2)]">{srNo}</td>
                            <td className="whitespace-nowrap px-4 py-3.5">{out.date}</td>
                            <td className="px-4 py-3.5 font-bold">{out.person}</td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{out.role || '-'}</td>
                            <td className="px-4 py-3.5 font-bold text-primary">{out.company}</td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)]">{out.medium}</td>
                            <td className="px-4 py-3.5 max-w-[200px] break-all text-[color:var(--txt1)] font-sans">
                              {out.contact ? (
                                out.contact.includes('@') ? (
                                  <div className="flex flex-col gap-0.5">
                                    {out.contact.split(',').map((email, i) => (
                                      <a key={i} href={`mailto:${email.trim()}`} className="text-secondary hover:underline">
                                        {email.trim()}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span>{out.contact}</span>
                                )
                              ) : (
                                <span className="text-charcoal/20">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-[color:var(--txt1)] font-sans">{out.contact2 || '-'}</td>
                            <td className="px-4 py-3.5">
                              {out.status ? (
                                <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 font-headline text-[9px] font-bold uppercase tracking-wider', getStatusBadgeClass(out.status))}>
                                  {out.status}
                                </span>
                              ) : (
                                <span className="text-charcoal/20">-</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-center">
                              <div className="inline-flex gap-1.5">
                                <button
                                  className="font-headline text-[10px] font-bold uppercase tracking-wider text-secondary hover:underline"
                                  onClick={() => setActiveModal({ type: 'edit_outreach', data: out })}
                                >
                                  Edit
                                </button>
                                <span className="text-charcoal/20">|</span>
                                <button
                                  className="font-headline text-[10px] font-bold uppercase tracking-wider text-error hover:underline"
                                  onClick={() => handleDeleteOutreach(out.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredOutreaches.length > 0 && (
                  <div className="flex flex-col items-center justify-between gap-4 border-t border-charcoal/10 bg-surface-container-low/30 px-6 py-4 sm:flex-row">
                    <div className="text-xs font-bold text-[color:var(--txt2)]">
                      Showing {Math.min(filteredOutreaches.length, (outreachPage - 1) * ITEMS_PER_PAGE + 1)} to{' '}
                      {Math.min(filteredOutreaches.length, outreachPage * ITEMS_PER_PAGE)} of{' '}
                      {filteredOutreaches.length} entries
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setOutreachPage(1)}
                        disabled={outreachPage === 1}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        &laquo; First
                      </TrackerButton>
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setOutreachPage(outreachPage - 1)}
                        disabled={outreachPage === 1}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        &lsaquo; Prev
                      </TrackerButton>

                      {Array.from({ length: outreachTotalPages }).map((_, i) => {
                        const p = i + 1;
                        const isActive = outreachPage === p;
                        return (
                          <TrackerButton
                            key={p}
                            variant={isActive ? 'primary' : 'secondary'}
                            onClick={() => setOutreachPage(p)}
                            className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                          >
                            {p}
                          </TrackerButton>
                        );
                      })}

                      <TrackerButton
                        variant="secondary"
                        onClick={() => setOutreachPage(outreachPage + 1)}
                        disabled={outreachPage === outreachTotalPages}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        Next &rsaquo;
                      </TrackerButton>
                      <TrackerButton
                        variant="secondary"
                        onClick={() => setOutreachPage(outreachTotalPages)}
                        disabled={outreachPage === outreachTotalPages}
                        className="px-3 py-1.5 h-8 flex items-center justify-center text-[10px]"
                      >
                        Last &raquo;
                      </TrackerButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* --- APPLICATION FORM MODAL --- */}
      {(activeModal.type === 'add_app' || activeModal.type === 'edit_app') && (
        <ModalShell
          labelledBy="modal-application-title"
          onClose={() => setActiveModal({ type: null })}
          panelClassName="max-w-xl bg-white border-2 border-charcoal shadow-tactile p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b border-charcoal/10 pb-3">
            <h2 id="modal-application-title" className="font-headline text-lg font-extrabold text-on-surface">
              {activeModal.type === 'add_app' ? 'Add Job Application' : 'Edit Job Application'}
            </h2>
            <button
              className="text-2xl font-bold text-charcoal/50 hover:text-charcoal"
              onClick={() => setActiveModal({ type: null })}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSaveApplication} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Job Role *
                </label>
                <input
                  required
                  name="job_role"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. AI Engineer"
                  defaultValue={activeModal.data?.job_role || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Company *
                </label>
                <input
                  required
                  name="company"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. True Tech"
                  defaultValue={activeModal.data?.company || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Date Applied *
                </label>
                <input
                  required
                  type="date"
                  name="date"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm focus:border-primary"
                  defaultValue={activeModal.data?.date || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Status
                </label>
                <input
                  name="status"
                  list="job-statuses"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Applied, Interviewing, Rejected"
                  defaultValue={activeModal.data?.status || 'Applied'}
                />
                <datalist id="job-statuses">
                  <option value="Applied" />
                  <option value="Applied (Cold Email Scheduled)" />
                  <option value="Interviewing" />
                  <option value="Rejected" />
                  <option value="Offer" />
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Source
                </label>
                <input
                  name="source"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. LinkedIn, Career Page"
                  defaultValue={activeModal.data?.source || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Method
                </label>
                <input
                  name="method"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Career Page, Cold Email"
                  defaultValue={activeModal.data?.method || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Recency (Days)
                </label>
                <input
                  name="recency"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. 1"
                  defaultValue={activeModal.data?.recency || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Experience
                </label>
                <input
                  name="experience"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Fresher, 1-2"
                  defaultValue={activeModal.data?.experience || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Done Via
                </label>
                <input
                  name="done_via"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. MeowFolio, Word"
                  defaultValue={activeModal.data?.done_via || 'MeowFolio'}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                placeholder="Additional recruitment details, referrers..."
                defaultValue={activeModal.data?.notes || ''}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reachout"
                name="reachout"
                value="yes"
                className="size-4 rounded border-charcoal text-primary focus:ring-primary"
                defaultChecked={activeModal.data?.reachout?.toLowerCase() === 'yes'}
              />
              <label htmlFor="reachout" className="font-headline text-xs font-bold text-on-surface">
                Reached out to Recruiter / HR?
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-charcoal/10 pt-3">
              <TrackerButton variant="secondary" onClick={() => setActiveModal({ type: null })}>
                Cancel
              </TrackerButton>
              <TrackerButton type="submit" variant="primary">
                Save Application
              </TrackerButton>
            </div>
          </form>
        </ModalShell>
      )}

      {/* --- OUTREACH FORM MODAL --- */}
      {(activeModal.type === 'add_outreach' || activeModal.type === 'edit_outreach') && (
        <ModalShell
          labelledBy="modal-outreach-title"
          onClose={() => setActiveModal({ type: null })}
          panelClassName="max-w-xl bg-white border-2 border-charcoal shadow-tactile p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b border-charcoal/10 pb-3">
            <h2 id="modal-outreach-title" className="font-headline text-lg font-extrabold text-on-surface">
              {activeModal.type === 'add_outreach' ? 'Add Outreach Contact' : 'Edit Outreach Contact'}
            </h2>
            <button
              className="text-2xl font-bold text-charcoal/50 hover:text-charcoal"
              onClick={() => setActiveModal({ type: null })}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSaveOutreach} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Contact Person *
                </label>
                <input
                  required
                  name="person"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Khushboo Sharma"
                  defaultValue={activeModal.data?.person || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Job Title / Role
                </label>
                <input
                  name="role"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. HR Recruiter"
                  defaultValue={activeModal.data?.role || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Company *
                </label>
                <input
                  required
                  name="company"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Arango"
                  defaultValue={activeModal.data?.company || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Outreach Date *
                </label>
                <input
                  required
                  type="date"
                  name="date"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm focus:border-primary"
                  defaultValue={activeModal.data?.date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Medium
                </label>
                <input
                  name="medium"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. LinkedIn, Cold Email"
                  defaultValue={activeModal.data?.medium || ''}
                />
              </div>

              <div>
                <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  Status
                </label>
                <input
                  name="status"
                  list="outreach-statuses"
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                  placeholder="e.g. Connection Accepted, Replied"
                  defaultValue={activeModal.data?.status || ''}
                />
                <datalist id="outreach-statuses">
                  <option value="Connection Accepted" />
                  <option value="Pending" />
                  <option value="Message Sent" />
                  <option value="Replied" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                Primary Contact Details
              </label>
              <textarea
                name="contact"
                rows={2}
                className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                placeholder="Emails (comma separated) or LinkedIn URLs..."
                defaultValue={activeModal.data?.contact || ''}
              />
            </div>

            <div>
              <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                Secondary Contact / Phone
              </label>
              <input
                name="contact2"
                className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-sm text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary"
                placeholder="Phone number or alternate handle..."
                defaultValue={activeModal.data?.contact2 || ''}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-charcoal/10 pt-3">
              <TrackerButton variant="secondary" onClick={() => setActiveModal({ type: null })}>
                Cancel
              </TrackerButton>
              <TrackerButton type="submit" variant="primary">
                Save Contact
              </TrackerButton>
            </div>
          </form>
        </ModalShell>
      )}
    </WorkspaceShell>
  );
}
