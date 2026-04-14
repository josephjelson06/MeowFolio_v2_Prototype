import { ToolbarPane } from 'pages/workspace/editor/components/ToolbarPane';
import type { ToolbarValues } from 'pages/workspace/editor/types';

export function EditorToolbarWorkspace({
  values,
  onChange,
}: {
  values: ToolbarValues;
  onChange: (patch: Partial<ToolbarValues>) => void;
}) {
  return <ToolbarPane values={values} onChange={onChange} className="xl:min-h-full xl:rounded-none xl:border-0 xl:bg-transparent xl:p-5 xl:shadow-none" />;
}
