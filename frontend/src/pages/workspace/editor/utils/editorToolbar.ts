import type { ToolbarValues } from 'pages/workspace/editor/types';
import type { RenderAccentColor, RenderOptions } from 'types/resumeDocument';

const ACCENT_COLORS: RenderAccentColor[] = ['charcoal', 'navy', 'slate', 'forest', 'berry'];

export function toolbarFromRenderOptions(options: RenderOptions): ToolbarValues {
  const marginStr = options.spacing?.margin || options.margin || '1cm';
  const margin = Number.parseFloat(marginStr) || 1;
  const accent = options.colors?.primaryAccent || options.accentColor || 'charcoal';

  return {
    colorIndex: Math.max(0, ACCENT_COLORS.indexOf(accent)),
    font: options.typography?.fontFamily || options.fontFamily || 'TeX Gyre Termes',
    fontSize: options.typography?.baseFontSize || options.fontSize || 11,
    lineSpacing: Math.round((options.typography?.lineHeight || options.lineSpacing || 1.15) * 100),
    margins: Math.round(margin * 10),
    sectionGap: options.spacing?.sectionGap ?? 14,
    entryGap: options.spacing?.entryGap ?? 8,
  };
}

export function applyToolbarValues(current: RenderOptions, values: ToolbarValues): RenderOptions {
  const accent = ACCENT_COLORS[values.colorIndex] ?? 'charcoal';
  const marginStr = `${(values.margins / 10).toFixed(1)}cm`;
  
  return {
    ...current,
    
    // Update nested structure
    layout: current.layout || { templateId: current.templateId || 'template2', headerStyle: 'centered' },
    typography: {
      ...current.typography,
      fontFamily: values.font as RenderOptions['fontFamily'],
      baseFontSize: values.fontSize,
      lineHeight: values.lineSpacing / 100,
    },
    spacing: {
      ...current.spacing,
      margin: marginStr,
      sectionGap: values.sectionGap,
      entryGap: values.entryGap,
    },
    colors: {
      ...current.colors,
      primaryAccent: accent,
    },
    
    // Also update legacy flat fields so we don't break existing templates that haven't been migrated yet
    accentColor: accent,
    fontFamily: values.font as RenderOptions['fontFamily'],
    fontSize: values.fontSize,
    lineSpacing: values.lineSpacing / 100,
    margin: marginStr,
  };
}
