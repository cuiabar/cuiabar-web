import type { Procedure } from './types';

const makeSalesProcedure = (id: string, title: string, objective: string, tags: string[]): Procedure => ({
  id,
  title,
  objective,
  whenToUse: `Quando houver oportunidade de ${title.toLowerCase()} sem pressionar o cliente.`,
  steps: ['Entenda momento e preferencia.', 'Ofereca uma opcao especifica.', 'Explique beneficio em uma frase.', 'Aceite recusa sem insistir.'],
  script: 'Pelo que voce pediu, uma boa opcao para completar e esta. Quer que eu inclua?',
  checklist: ['Oferta especifica', 'Sem pressao', 'Beneficio claro', 'Pedido confirmado'],
  commonErrors: ['Oferecer tudo ao mesmo tempo', 'Insistir apos recusa', 'Nao conhecer produto'],
  correctiveAction: 'Volte para atendimento consultivo: preferencia, sugestao unica e confirmacao.',
  tags,
});

export const conversaoProcedures: Procedure[] = [
  makeSalesProcedure('venda-adicional', 'Venda adicional', 'Aumentar valor percebido com itens pertinentes.', ['venda']),
  makeSalesProcedure('bebidas', 'Bebidas', 'Conectar bebida ao prato e ao momento da mesa.', ['bebida']),
  makeSalesProcedure('sobremesas', 'Sobremesas', 'Fechar experiencia com sugestao simples no fim da refeicao.', ['sobremesa']),
  makeSalesProcedure('combos', 'Combos', 'Agrupar itens para facilitar decisao e aumentar ticket.', ['combo']),
  makeSalesProcedure('aumento-ticket', 'Aumento de ticket', 'Elevar ticket medio mantendo satisfacao.', ['ticket']),
  makeSalesProcedure('abordagem-consultiva', 'Abordagem consultiva', 'Vender ajudando o cliente a decidir melhor.', ['consultiva']),
  makeSalesProcedure('scripts-presenciais', 'Scripts presenciais', 'Padronizar falas de oferta no salao.', ['script', 'salao']),
  makeSalesProcedure('scripts-whatsapp', 'Scripts WhatsApp', 'Criar ofertas curtas e claras no atendimento digital.', ['script', 'whatsapp']),
  makeSalesProcedure('objecoes', 'Objecoes', 'Responder duvidas sem confronto e sem desconto automatico.', ['objecao']),
  makeSalesProcedure('cliente-indeciso', 'Cliente indeciso', 'Reduzir opcoes e conduzir decisao.', ['decisao']),
  makeSalesProcedure('upsell', 'Upsell', 'Sugerir versao melhor quando fizer sentido.', ['upsell']),
  makeSalesProcedure('cross-sell', 'Cross-sell', 'Sugerir complemento natural ao pedido.', ['cross-sell']),
];
