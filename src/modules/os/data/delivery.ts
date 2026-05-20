import type { Procedure } from './types';

const makeDeliveryProcedure = (id: string, title: string, objective: string, tags: string[]): Procedure => ({
  id,
  title,
  objective,
  whenToUse: `Na rotina de delivery quando houver ${title.toLowerCase()}.`,
  steps: ['Confira pedido no canal de origem.', 'Valide itens, observacoes e forma de entrega.', 'Comunique prazo real.', 'Registre qualquer excecao antes do despacho.'],
  script: 'Estamos conferindo seu pedido para sair correto. Se houver qualquer ajuste, avisamos por aqui.',
  checklist: ['Canal conferido', 'Itens conferidos', 'Observacoes verificadas', 'Status atualizado'],
  commonErrors: ['Nao ler observacao', 'Despachar sem lacre', 'Nao avisar atraso'],
  correctiveAction: 'Pause o despacho, corrija a divergencia e registre a causa para revisao do turno.',
  tags,
});

export const deliveryProcedures: Procedure[] = [
  makeDeliveryProcedure('recebimento-pedido', 'Recebimento de pedido', 'Garantir que todo pedido entre no fluxo correto.', ['pedido', 'triagem']),
  makeDeliveryProcedure('conferencia', 'Conferencia', 'Evitar item faltante, item errado e observacao ignorada.', ['conferencia']),
  makeDeliveryProcedure('embalagem', 'Embalagem', 'Proteger temperatura, montagem e apresentacao do prato.', ['embalagem']),
  makeDeliveryProcedure('lacre', 'Lacre', 'Garantir integridade do pedido ate o cliente.', ['lacre', 'seguranca']),
  makeDeliveryProcedure('despacho', 'Despacho', 'Entregar pedido certo ao entregador certo.', ['despacho']),
  makeDeliveryProcedure('entregador', 'Contato com entregador', 'Alinhar retirada, atraso e localizacao sem ruído.', ['entregador']),
  makeDeliveryProcedure('pedido-atrasado', 'Pedido atrasado', 'Avisar cliente e canal antes de escalar problema.', ['atraso']),
  makeDeliveryProcedure('pedido-errado', 'Pedido errado', 'Diagnosticar origem da falha e corrigir sem confronto.', ['erro']),
  makeDeliveryProcedure('reenvio', 'Reenvio', 'Refazer ou reenviar pedido com controle de custo e prioridade.', ['reenvio']),
  makeDeliveryProcedure('cancelamento', 'Cancelamento', 'Tratar cancelamentos com rastreio de motivo e etapa.', ['cancelamento']),
  makeDeliveryProcedure('ifood', 'Operacao iFood', 'Manter loja, prazos e chamados alinhados no iFood.', ['ifood']),
  makeDeliveryProcedure('food99', 'Operacao 99Food', 'Padronizar atendimento e atualizacao no 99Food.', ['99food']),
  makeDeliveryProcedure('loja-propria', 'Loja propria', 'Controlar pedidos diretos com atendimento humano e margem protegida.', ['loja propria']),
];
