export type ModuleKey =
  | 'inbound' | 'outbound' | 'content' | 'paid' | 'nurture' | 'infra' | 'attr';

export type Maturity = 0 | 1 | 2 | 3 | null;

export type LeverValue = {
  present: boolean;
  maturity: Maturity;
  applicable: boolean;
};

// per module, lever id -> value
export type ModuleResponses = Record<string, LeverValue>;

// all modules, module key -> module responses (optional if nothing answered)
export type Responses = Partial<Record<ModuleKey, ModuleResponses>>;
