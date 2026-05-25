export interface Phase3CriticalLens {
  lens_name: string;
  application: string;
}

export interface CharacterPairingQuote {
  quote: string;
  analysis: string;
}

export interface EntitySide {
  name: string;
  system_of_oppression: string;
  primary_method: string;
  key_quotes: CharacterPairingQuote[];
  ao1_sophistication: string;
}

export interface CharacterPairingSynthesis {
  comparative_pivot: string;
  ao3_context_link: string;
}

export interface CharacterPairing {
  id: string;
  theme: string;
  functional_equivalence: string;
  dickens_entity: EntitySide;
  mcewan_entity: EntitySide;
  synthesis: CharacterPairingSynthesis;
  phase3_critical_lenses: Phase3CriticalLens[];
}
