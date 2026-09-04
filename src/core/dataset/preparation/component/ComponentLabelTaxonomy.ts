import { ComponentLabelRecord } from './ComponentPreparationTypes';

export const COMPONENT_TAXONOMY_VERSION = 'component-recommendation-labels-v0.1';

export const COMPONENT_RECOMMENDATION_TAXONOMY: ComponentLabelRecord[] = [
  {
    labelId: 'comp_btn',
    canonicalName: 'button',
    sourceLabels: ['button', 'btn', 'clickable_icon', 'cta', 'a.btn', 'input[type=button]'],
    definition: 'Interactive trigger element for submitting actions, triggers, or form submissions.',
    derivationRule: 'Element has clickable role, button tag, or action keyword (submit, click, send, login, sign in, ok, cancel).',
    confidence: 0.95,
    sourceCoverage: 0.92,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_txt',
    canonicalName: 'text',
    sourceLabels: ['text', 'label', 'paragraph', 'p', 'span', 'description'],
    definition: 'General descriptive or body text element block.',
    derivationRule: 'Element contains text content without heading tag or button action.',
    confidence: 0.90,
    sourceCoverage: 0.95,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_hdg',
    canonicalName: 'heading',
    sourceLabels: ['heading', 'title', 'h1', 'h2', 'h3', 'h4', 'header_text'],
    definition: 'Section title or header text providing structural hierarchy.',
    derivationRule: 'Element has heading tag (h1-h6), title role, or dominant font size.',
    confidence: 0.92,
    sourceCoverage: 0.88,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_img',
    canonicalName: 'image',
    sourceLabels: ['image', 'img', 'picture', 'photo', 'illustration', 'banner'],
    definition: 'Visual media asset element representing photos, illustrations, or graphics.',
    derivationRule: 'Element has img tag, photo role, or image asset node type.',
    confidence: 0.95,
    sourceCoverage: 0.85,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_icn',
    canonicalName: 'icon',
    sourceLabels: ['icon', 'svg_icon', 'symbol', 'vector_icon', 'i.icon'],
    definition: 'Small standalone visual symbol or graphic indicator.',
    derivationRule: 'Element has small square dimensions (<= 48px), svg tag, or icon role.',
    confidence: 0.88,
    sourceCoverage: 0.82,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_inp',
    canonicalName: 'input',
    sourceLabels: ['input', 'text_input', 'textbox', 'edit_text', 'search_input'],
    definition: 'Single-line text entry field for user data entry.',
    derivationRule: 'Element has input/textbox tag or edit_text class.',
    confidence: 0.94,
    sourceCoverage: 0.89,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_chk',
    canonicalName: 'checkbox',
    sourceLabels: ['checkbox', 'check', 'input[type=checkbox]'],
    definition: 'Binary toggle control allowing multi-selection preference.',
    derivationRule: 'Element has checkbox role or type.',
    confidence: 0.96,
    sourceCoverage: 0.70,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_rad',
    canonicalName: 'radio',
    sourceLabels: ['radio', 'radio_button', 'input[type=radio]'],
    definition: 'Single-selection toggle option control within a group.',
    derivationRule: 'Element has radio role or type.',
    confidence: 0.96,
    sourceCoverage: 0.65,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_swt',
    canonicalName: 'switch',
    sourceLabels: ['switch', 'toggle', 'toggle_switch'],
    definition: 'State transition switch for binary settings.',
    derivationRule: 'Element has switch role or toggle class.',
    confidence: 0.92,
    sourceCoverage: 0.60,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_drp',
    canonicalName: 'dropdown',
    sourceLabels: ['dropdown', 'select', 'combobox', 'spinner'],
    definition: 'Selection menu presenting a list of choices on trigger.',
    derivationRule: 'Element has select tag, combobox role, or spinner component class.',
    confidence: 0.91,
    sourceCoverage: 0.75,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_nav',
    canonicalName: 'navigation',
    sourceLabels: ['navigation', 'navbar', 'nav', 'header_nav', 'menu_bar'],
    definition: 'Container bar or list providing navigation links across pages/sections.',
    derivationRule: 'Element has nav tag, navbar class, or header navigation container role.',
    confidence: 0.89,
    sourceCoverage: 0.80,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_crd',
    canonicalName: 'card',
    sourceLabels: ['card', 'card_container', 'tile', 'panel_card'],
    definition: 'Self-contained surface grouping related content and actions.',
    derivationRule: 'Container with defined background/border containing header, media, and action elements.',
    confidence: 0.87,
    sourceCoverage: 0.85,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_lst',
    canonicalName: 'list',
    sourceLabels: ['list', 'ul', 'ol', 'recycler_view', 'list_view'],
    definition: 'Ordered or unordered repetitive vertical container group.',
    derivationRule: 'Element has list tag (ul/ol) or RecyclerView / ListView structure with repeated siblings.',
    confidence: 0.90,
    sourceCoverage: 0.88,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_grd',
    canonicalName: 'grid',
    sourceLabels: ['grid', 'grid_view', 'data_grid', 'tiles_grid'],
    definition: '2D multi-column repeated items layout container.',
    derivationRule: 'Element has grid layout display or GridView component class.',
    confidence: 0.88,
    sourceCoverage: 0.78,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_mdl',
    canonicalName: 'modal',
    sourceLabels: ['modal', 'dialog', 'popup', 'alert_dialog'],
    definition: 'Overlay container interrupting workflow for high-priority interaction.',
    derivationRule: 'Overlay window with backdrop and dialog role.',
    confidence: 0.93,
    sourceCoverage: 0.68,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_dlg',
    canonicalName: 'dialog',
    sourceLabels: ['dialog', 'alert', 'confirm_dialog'],
    definition: 'Prompt overlay requiring user decision or confirmation.',
    derivationRule: 'Alert or dialog popup container.',
    confidence: 0.91,
    sourceCoverage: 0.65,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_tab',
    canonicalName: 'tab',
    sourceLabels: ['tab', 'tab_bar', 'tab_item', 'tab_container'],
    definition: 'Segmented navigation selector switching content views.',
    derivationRule: 'Element has tab or tablist role.',
    confidence: 0.92,
    sourceCoverage: 0.72,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_mnu',
    canonicalName: 'menu',
    sourceLabels: ['menu', 'context_menu', 'dropdown_menu'],
    definition: 'Popup or slide-out menu list of actionable items.',
    derivationRule: 'Element has menu or menuitem role.',
    confidence: 0.89,
    sourceCoverage: 0.70,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_tlb',
    canonicalName: 'toolbar',
    sourceLabels: ['toolbar', 'action_bar', 'top_app_bar'],
    definition: 'Action bar hosting page title, navigation icon, and primary action controls.',
    derivationRule: 'Top bar container with title and action button group.',
    confidence: 0.90,
    sourceCoverage: 0.82,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_ava',
    canonicalName: 'avatar',
    sourceLabels: ['avatar', 'profile_image', 'user_thumb'],
    definition: 'Circular thumbnail or icon representing a user profile.',
    derivationRule: 'Small circular image (aspect ratio ~1.0, rounded-full or avatar class).',
    confidence: 0.93,
    sourceCoverage: 0.74,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_bdg',
    canonicalName: 'badge',
    sourceLabels: ['badge', 'chip', 'tag', 'status_pill'],
    definition: 'Small status indicator or counter tag.',
    derivationRule: 'Small compact inline element with tag, chip, or badge class.',
    confidence: 0.88,
    sourceCoverage: 0.76,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_div',
    canonicalName: 'divider',
    sourceLabels: ['divider', 'hr', 'separator'],
    definition: 'Thin visual separator dividing sections or list items.',
    derivationRule: 'Element has hr tag, separator role, or height <= 2px.',
    confidence: 0.95,
    sourceCoverage: 0.84,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_frm',
    canonicalName: 'form',
    sourceLabels: ['form', 'form_container', 'input_group'],
    definition: 'Group container holding related input fields and action buttons.',
    derivationRule: 'Element has form tag or multiple child input and button controls.',
    confidence: 0.91,
    sourceCoverage: 0.83,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_tbl',
    canonicalName: 'table',
    sourceLabels: ['table', 'data_table', 'grid_table'],
    definition: 'Tabular data container with header row and structured data cells.',
    derivationRule: 'Element has table tag or table/grid role.',
    confidence: 0.92,
    sourceCoverage: 0.68,
    validationStatus: 'valid'
  },
  {
    labelId: 'comp_oth',
    canonicalName: 'other',
    sourceLabels: ['container', 'div', 'view', 'wrapper', 'unknown'],
    definition: 'Generic or unclassified UI structural container.',
    derivationRule: 'Structural element that does not match specific component categories.',
    confidence: 0.70,
    sourceCoverage: 1.00,
    validationStatus: 'valid'
  }
];
