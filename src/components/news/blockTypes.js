import {
  AlignLeft,
  ArrowLeftRight,
  CalendarRange,
  ChartColumn,
  Heading2,
  Image as ImageIcon,
  Landmark,
  Quote,
  TriangleAlert,
} from 'lucide-react';

// Espelha src/services/newsBlocks.ts do backend. Altere os dois juntos.

export const BLOCK_DEFINITIONS = [
  {
    type: 'paragraph',
    label: 'Texto',
    description: 'Parágrafo simples do corpo da matéria.',
    icon: AlignLeft,
    keywords: 'texto paragrafo corpo escrever',
    create: () => ({ text: '' }),
  },
  {
    type: 'heading',
    label: 'Subtítulo',
    description: 'Divide a matéria em seções.',
    icon: Heading2,
    keywords: 'titulo subtitulo secao cabecalho h2',
    create: () => ({ text: '' }),
  },
  {
    type: 'quote',
    label: 'Citação',
    description: 'Fala em destaque, com autoria opcional.',
    icon: Quote,
    keywords: 'citacao fala aspas depoimento',
    create: () => ({ text: '', attribution: '' }),
  },
  {
    type: 'image',
    label: 'Imagem',
    description: 'Foto no meio do texto, com legenda.',
    icon: ImageIcon,
    keywords: 'imagem foto figura capa legenda',
    create: () => ({ filename: '', caption: '' }),
  },
  {
    type: 'investment',
    label: 'Investimento',
    description: 'Valor em destaque com rótulo e fonte.',
    icon: Landmark,
    keywords: 'investimento valor orcamento dinheiro recurso',
    create: () => ({ value: '', label: '', source: '' }),
  },
  {
    type: 'indicators',
    label: 'Indicadores',
    description: 'Grade de números grandes com legenda.',
    icon: ChartColumn,
    keywords: 'indicadores numeros metricas dados grafico',
    create: () => ({ items: [{ value: '', label: '' }] }),
  },
  {
    type: 'timeline',
    label: 'Cronograma',
    description: 'Linha do tempo vertical por etapas.',
    icon: CalendarRange,
    keywords: 'cronograma linha do tempo etapas prazo fase',
    create: () => ({ items: [{ date: '', title: '', description: '' }] }),
  },
  {
    type: 'before_after',
    label: 'Antes e depois',
    description: 'Duas fotos comparadas lado a lado.',
    icon: ArrowLeftRight,
    keywords: 'antes depois comparacao obra reforma',
    create: () => ({ before: { filename: '', caption: '' }, after: { filename: '', caption: '' } }),
  },
  {
    type: 'related_report',
    label: 'Denúncia relacionada',
    description: 'Card com link para um relato existente.',
    icon: TriangleAlert,
    keywords: 'denuncia relato problema chamado vinculado',
    create: () => ({ report_id: '' }),
  },
];

export const BLOCK_MAP = BLOCK_DEFINITIONS.reduce((map, definition) => {
  map[definition.type] = definition;
  return map;
}, {});

export function newBlockId() {
  return crypto.randomUUID();
}

export function createBlock(type) {
  const definition = BLOCK_MAP[type];
  if (!definition) return null;
  return { id: newBlockId(), type, ...definition.create() };
}

export function emptyParagraph() {
  return createBlock('paragraph');
}

const filled = (value) => typeof value === 'string' && value.trim() !== '';

function keptIndicators(items) {
  return (items || [])
    .filter((item) => filled(item.value) && filled(item.label))
    .map((item) => ({ value: item.value.trim(), label: item.label.trim() }));
}

function keptSteps(items) {
  return (items || [])
    .filter((item) => filled(item.date) && filled(item.title))
    .map((item) => ({
      date: item.date.trim(),
      title: item.title.trim(),
      ...(filled(item.description) ? { description: item.description.trim() } : {}),
    }));
}

function keptImage(image) {
  return {
    filename: image.filename,
    ...(filled(image.caption) ? { caption: image.caption.trim() } : {}),
  };
}

// Blocos incompletos são ruído de edição: o backend rejeitaria a matéria inteira
// por causa deles, então o editor descarta antes de enviar.
export function prepareBlocksForSave(blocks) {
  return blocks.reduce((list, block) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        if (filled(block.text)) list.push({ id: block.id, type: block.type, text: block.text.trim() });
        break;
      case 'quote':
        if (filled(block.text)) {
          list.push({
            id: block.id,
            type: 'quote',
            text: block.text.trim(),
            ...(filled(block.attribution) ? { attribution: block.attribution.trim() } : {}),
          });
        }
        break;
      case 'image':
        if (filled(block.filename)) list.push({ id: block.id, type: 'image', ...keptImage(block) });
        break;
      case 'investment':
        if (filled(block.value) && filled(block.label)) {
          list.push({
            id: block.id,
            type: 'investment',
            value: block.value.trim(),
            label: block.label.trim(),
            ...(filled(block.source) ? { source: block.source.trim() } : {}),
          });
        }
        break;
      case 'indicators': {
        const items = keptIndicators(block.items);
        if (items.length) list.push({ id: block.id, type: 'indicators', items });
        break;
      }
      case 'timeline': {
        const items = keptSteps(block.items);
        if (items.length) list.push({ id: block.id, type: 'timeline', items });
        break;
      }
      case 'before_after':
        if (filled(block.before?.filename) && filled(block.after?.filename)) {
          list.push({
            id: block.id,
            type: 'before_after',
            before: keptImage(block.before),
            after: keptImage(block.after),
          });
        }
        break;
      case 'related_report': {
        const reportId = Number(block.report_id);
        if (Number.isInteger(reportId) && reportId > 0) {
          list.push({ id: block.id, type: 'related_report', report_id: reportId });
        }
        break;
      }
      default:
        break;
    }
    return list;
  }, []);
}

// Avisa antes de salvar, em vez de deixar o backend devolver um erro genérico.
export function findBlockProblem(block) {
  const definition = BLOCK_MAP[block.type];
  if (!definition) return 'Bloco desconhecido.';

  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return filled(block.text) ? null : `${definition.label} está vazio.`;
    case 'quote':
      return filled(block.text) ? null : 'A citação está vazia.';
    case 'image':
      return filled(block.filename) ? null : 'Envie a imagem do bloco de imagem.';
    case 'investment':
      if (!filled(block.value)) return 'Informe o valor do investimento.';
      return filled(block.label) ? null : 'Informe o rótulo do investimento.';
    case 'indicators':
      return keptIndicators(block.items).length ? null : 'Preencha ao menos um indicador (número e legenda).';
    case 'timeline':
      return keptSteps(block.items).length ? null : 'Preencha ao menos uma etapa (data e título).';
    case 'before_after':
      if (!filled(block.before?.filename)) return 'Envie a foto do "antes".';
      return filled(block.after?.filename) ? null : 'Envie a foto do "depois".';
    case 'related_report':
      return Number.isInteger(Number(block.report_id)) && Number(block.report_id) > 0
        ? null
        : 'Informe o número da denúncia relacionada.';
    default:
      return null;
  }
}

export function filterBlockDefinitions(query) {
  const term = query.trim().toLowerCase();
  if (!term) return BLOCK_DEFINITIONS;
  return BLOCK_DEFINITIONS.filter((definition) => (
    definition.label.toLowerCase().includes(term)
    || definition.description.toLowerCase().includes(term)
    || definition.keywords.includes(term)
  ));
}

export function isBlockEmpty(block) {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return !filled(block.text);
    case 'quote':
      return !filled(block.text) && !filled(block.attribution);
    case 'image':
      return !filled(block.filename) && !filled(block.caption);
    case 'investment':
      return !filled(block.value) && !filled(block.label) && !filled(block.source);
    case 'indicators':
      return (block.items || []).every((item) => !filled(item.value) && !filled(item.label));
    case 'timeline':
      return (block.items || []).every((item) => !filled(item.date) && !filled(item.title) && !filled(item.description));
    case 'before_after':
      return !filled(block.before?.filename) && !filled(block.before?.caption)
        && !filled(block.after?.filename) && !filled(block.after?.caption);
    case 'related_report':
      return !filled(String(block.report_id ?? ''));
    default:
      return true;
  }
}

// Campo que recebe o foco logo após criar o bloco.
const FIRST_FIELD = {
  paragraph: 'text',
  heading: 'text',
  quote: 'text',
  image: 'caption',
  investment: 'value',
  indicators: '0.value',
  timeline: '0.date',
  before_after: 'before.caption',
  related_report: 'report_id',
};

export function firstFieldOf(type) {
  return FIRST_FIELD[type] ?? 'text';
}
