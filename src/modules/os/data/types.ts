export type OsModuleId = 'atendimento' | 'delivery' | 'pops' | 'conversao' | 'recomendacoes';

export type Procedure = {
  id: string;
  title: string;
  objective: string;
  whenToUse: string;
  steps: string[];
  script: string;
  checklist: string[];
  commonErrors: string[];
  correctiveAction: string;
  tags: string[];
};

export type Recommendation = {
  id: string;
  title: string;
  diagnosis: string;
  procedure: string[];
  suggestedScript: string;
  checklist: string[];
  correctiveAction: string;
  tags: string[];
};

export type OsModule = {
  id: OsModuleId;
  title: string;
  path: string;
  description: string;
  accent: string;
};
