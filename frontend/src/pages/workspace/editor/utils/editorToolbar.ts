import type { ToolbarValues } from 'pages/workspace/editor/types';
import type { RenderAccentColor, RenderOptions } from 'types/resumeDocument';

const ACCENT_COLORS: RenderAccentColor[] = ['charcoal', 'navy', 'slate', 'forest', 'berry'];

export function toolbarFromRenderOptions(options: RenderOptions): ToolbarValues {
  const margin = Number.parseFloat(options.margin) || 1;
  return {
    colorIndex: Math.max(0, ACCENT_COLORS.indexOf(options.accentColor)),
    font: options.fontFamily,
    fontSize: options.fontSize,
    lineSpacing: Math.round(options.lineSpacing * 100),
    margins: Math.round(margin * 10),
  };
}

export function applyToolbarValues(current: RenderOptions, values: ToolbarValues): RenderOptions {
  return {
    ...current,
    accentColor: ACCENT_COLORS[values.colorIndex] ?? 'charcoal',
    fontFamily: values.font as RenderOptions['fontFamily'],
    fontSize: values.fontSize,
    lineSpacing: values.lineSpacing / 100,
    margin: `${(values.margins / 10).toFixed(1)}cm`,
  };
}
