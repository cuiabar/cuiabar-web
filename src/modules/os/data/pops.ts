import type { Procedure } from './types';

const makePop = (id: string, title: string, objective: string, tags: string[]): Procedure => ({
  id,
  title,
  objective,
  whenToUse: `Sempre que a rotina envolver ${title.toLowerCase()}.`,
  steps: ['Prepare area e materiais.', 'Execute o procedimento sem interromper etapas criticas.', 'Registre quando aplicavel.', 'Comunique desvio ao responsavel.'],
  script: 'Procedimento em execucao. Vou finalizar a etapa, registrar e liberar a area conforme padrao.',
  checklist: ['Materiais corretos', 'Tempo respeitado', 'Area identificada', 'Registro feito'],
  commonErrors: ['Pular etapa', 'Misturar utensilios', 'Nao registrar', 'Usar produto sem diluicao correta'],
  correctiveAction: 'Interrompa o uso da area ou item, refaca o processo e registre o desvio para correcao.',
  tags,
});

export const popsProcedures: Procedure[] = [
  makePop('lavagem-maos', 'Lavagem de maos', 'Reduzir risco de contaminacao por contato manual.', ['higiene']),
  makePop('higiene-pessoal', 'Higiene pessoal', 'Manter padrao individual seguro para manipulacao.', ['higiene']),
  makePop('uniforme', 'Uniforme', 'Garantir apresentacao e barreira higienica adequada.', ['equipe']),
  makePop('manipulacao-alimentos', 'Manipulacao de alimentos', 'Preservar seguranca alimentar durante preparo.', ['alimentos']),
  makePop('sanitizacao', 'Sanitizacao', 'Aplicar limpeza e sanitizacao com produto e tempo corretos.', ['sanitizacao']),
  makePop('limpeza', 'Limpeza', 'Manter areas, bancadas e utensilios prontos para uso.', ['limpeza']),
  makePop('armazenamento', 'Armazenamento', 'Guardar produtos por categoria, temperatura e validade.', ['estoque']),
  makePop('validade', 'Validade', 'Controlar uso seguro por data e lote.', ['validade']),
  makePop('etiquetagem', 'Etiquetagem', 'Identificar preparos, abertura, validade e responsavel.', ['etiqueta']),
  makePop('abertura-cozinha', 'Abertura de cozinha', 'Iniciar operacao com areas, equipamentos e insumos verificados.', ['abertura']),
  makePop('fechamento-cozinha', 'Fechamento de cozinha', 'Encerrar turno com seguranca, limpeza e registros completos.', ['fechamento']),
  makePop('temperatura', 'Temperatura', 'Monitorar faixa segura de armazenamento e preparo.', ['temperatura']),
  makePop('contaminacao-cruzada', 'Contaminacao cruzada', 'Separar fluxos crus, prontos, utensilios e superficies.', ['seguranca alimentar']),
];
