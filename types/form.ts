export type ModuleKey =
  | 'inbound' | 'outbound' | 'content' | 'paid' | 'nurture' | 'infra' | 'attr';

export type LeverValue = {
  present: boolean;
  applicable: boolean;
};

// per module, lever id -> value
export type ModuleResponses = Record<string, LeverValue>;

// all modules, module key -> module responses (optional if nothing answered)
export type Responses = Partial<Record<ModuleKey, ModuleResponses>>;
