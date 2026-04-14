import { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from 'lib/cn';
import { usePageViewportMode } from 'pages/workspace/editor/hooks/usePageViewportMode';
import type { EditorSectionItem } from 'pages/workspace/editor/types';

function buildTransform(transform: { x: number; y: number } | null, isDragging: boolean) {
  if (!transform) {
    return isDragging ? 'scale(1.02)' : undefined;
  }

  return `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.02 : 1})`;
}

function SectionGhost({ section, mobile }: { section: EditorSectionItem; mobile: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none select-none border-[1.5px] border-charcoal/80 bg-white/95 shadow-tactile',
        mobile
          ? 'inline-flex min-h-12 min-w-[9rem] items-center gap-3 rounded-full px-4 py-2.5'
          : 'flex items-center gap-3 rounded-[1rem] px-4 py-3',
      )}
    >
      <span className={cn('grid size-4 place-items-center rounded-full border', section.done ? 'border-tertiary bg-tertiary text-white' : 'border-outline bg-white')}>
        <span className={cn('size-2 rounded-full', section.done ? 'bg-white' : 'bg-outline')} />
      </span>
      <span className="truncate text-sm font-semibold text-on-surface">{section.label}</span>
    </div>
  );
}

function SortableSectionItem({
  section,
  activeSection,
  onSelect,
  onRemove,
  mobile,
}: {
  section: EditorSectionItem;
  activeSection: string;
  onSelect: (section: string) => void;
  onRemove: (section: string) => void;
  mobile: boolean;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
    disabled: !section.movable,
  });

  const active = activeSection === section.id;

  if (mobile) {
    return (
      <div
        ref={setNodeRef}
        className="shrink-0"
        style={{
          transform: buildTransform(transform, isDragging),
          transition,
          zIndex: isDragging ? 30 : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'inline-flex min-h-12 min-w-[8.75rem] items-center gap-3 rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition',
              section.movable && 'cursor-grab active:cursor-grabbing',
              active
                ? 'border-charcoal/75 bg-surface text-on-surface shadow-tactile-sm'
                : 'border-outline-variant bg-white/80 text-[color:var(--txt1)] hover:border-charcoal/55 hover:bg-white',
              isDragging && 'shadow-tactile',
            )}
            type="button"
            onClick={() => onSelect(section.id)}
            {...attributes}
            {...listeners}
          >
            <span className={cn('grid size-4 place-items-center rounded-full border', section.done ? 'border-tertiary bg-tertiary text-white' : 'border-outline bg-white')}>
              <span className={cn('size-2 rounded-full', section.done ? 'bg-white' : 'bg-outline')} />
            </span>
            <span className="truncate">{section.label}</span>
          </button>
          {active && section.removable ? (
            <button
              className="grid size-10 place-items-center rounded-full border border-outline bg-white text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface"
              type="button"
              onClick={() => onRemove(section.id)}
            >
              X
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: buildTransform(transform, isDragging),
        transition,
        zIndex: isDragging ? 20 : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-[1rem] border px-4 py-3 text-left text-sm font-semibold transition',
            section.movable && 'cursor-grab active:cursor-grabbing',
            active
              ? 'border-charcoal/75 bg-surface text-on-surface shadow-tactile-sm'
              : 'border-outline-variant bg-white/70 text-[color:var(--txt1)] hover:border-charcoal/55 hover:bg-white',
            isDragging && 'shadow-tactile',
          )}
          type="button"
          onClick={() => onSelect(section.id)}
          {...attributes}
          {...listeners}
        >
          <span className={cn('grid size-4 place-items-center rounded-full border', section.done ? 'border-tertiary bg-tertiary text-white' : 'border-outline bg-white')}>
            <span className={cn('size-2 rounded-full', section.done ? 'bg-white' : 'bg-outline')} />
          </span>
          <span className="truncate">{section.label}</span>
        </button>
        {active && section.removable ? (
          <button
            className="grid size-10 place-items-center rounded-full border border-outline bg-white text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface"
            type="button"
            onClick={() => onRemove(section.id)}
          >
            X
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SectionNav({
  sections,
  activeSection,
  onSelect,
  onAddCustomSection,
  onReorder,
  onRemoveSection,
  className,
}: {
  sections: EditorSectionItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  onAddCustomSection: () => void;
  onReorder: (fromId: string, toId: string) => void;
  onRemoveSection: (section: string) => void;
  className?: string;
}) {
  const { isMobile } = usePageViewportMode();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sectionIds = useMemo(() => sections.map(section => section.id), [sections]);
  const draggingSection = sections.find(section => section.id === draggingId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId || activeId === overId) return;
    onReorder(activeId, overId);
  }

  function handleDragCancel() {
    setDraggingId(null);
  }

  if (isMobile) {
    return (
      <div className={cn('grid gap-4', className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Sections</div>
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-3.5 py-2 font-headline text-[10px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onAddCustomSection}
          >
            + Add custom
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div className="-mx-1 overflow-x-auto pb-2">
            <SortableContext items={sectionIds} strategy={horizontalListSortingStrategy}>
              <div className="flex min-w-max gap-2 px-1">
                {sections.map(section => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    activeSection={activeSection}
                    onSelect={onSelect}
                    onRemove={onRemoveSection}
                    mobile
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <DragOverlay>{draggingSection ? <SectionGhost section={draggingSection} mobile /> : null}</DragOverlay>
        </DndContext>
      </div>
    );
  }

  return (
    <div className={cn('grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Sections</div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--txt2)]">Drag to reorder</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="grid min-h-0 content-start gap-2 overflow-y-auto pr-1">
            {sections.map(section => (
              <SortableSectionItem
                key={section.id}
                section={section}
                activeSection={activeSection}
                onSelect={onSelect}
                onRemove={onRemoveSection}
                mobile={false}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{draggingSection ? <SectionGhost section={draggingSection} mobile={false} /> : null}</DragOverlay>
      </DndContext>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
        type="button"
        onClick={onAddCustomSection}
      >
        + Add custom
      </button>
    </div>
  );
}
