import type { ToolbarValues } from 'pages/workspace/editor/types';
import type { RenderAccentColor, RenderOptions, RenderFontFamily } from 'types/resumeDocument';

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
    pageSize: options.layout?.pageSize || options.pageSize || 'letter',
    headingsFont: options.typography?.headingFont || options.headingsFont || 'TeX Gyre Termes',
    sectionDivider: options.layout?.sectionDivider || options.sectionDivider || 'rule',
    bulletStyle: options.layout?.bulletStyle || options.bulletStyle || 'bullet',
    headerStyle: options.layout?.headerStyle || 'centered',
  };
}

export function applyToolbarValues(current: RenderOptions, values: ToolbarValues): RenderOptions {
  const accent = ACCENT_COLORS[values.colorIndex] ?? 'charcoal';
  const marginStr = `${(values.margins / 10).toFixed(1)}cm`;
  
  return {
    ...current,
    
    // Update nested structure
    layout: {
      ...current.layout,
      templateId: current.layout?.templateId || current.templateId || 'template2',
      headerStyle: values.headerStyle,
      pageSize: values.pageSize,
      sectionDivider: values.sectionDivider,
      bulletStyle: values.bulletStyle,
    },
    typography: {
      ...current.typography,
      fontFamily: values.font as RenderFontFamily,
      headingFont: values.headingsFont as RenderFontFamily,
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
    fontFamily: values.font as RenderFontFamily,
    fontSize: values.fontSize,
    lineSpacing: values.lineSpacing / 100,
    margin: marginStr,
    pageSize: values.pageSize,
    headingsFont: values.headingsFont as RenderFontFamily,
    sectionDivider: values.sectionDivider,
    bulletStyle: values.bulletStyle,
  };
}
