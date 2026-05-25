import React from 'react';
import { characterPairings } from '../data/characterPairingSeed';
import { CharacterPairingCard } from '../components/character-pairing/CharacterPairingCard';

export default function Phase3Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-6 lg:px-10">
      <header className="mb-12 max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Stage 3 / Phase 3 Integration</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">Phase 3: Character Pairings</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Definitive comparative pairs for Pearson Edexcel Component 2. Each card enforces 
          functional equivalence to support A* woven arguments rather than flat character summaries.
        </p>
      </header>

      <main className="space-y-12 max-w-6xl mx-auto">
        {characterPairings.map((pairing) => (
          <CharacterPairingCard key={pairing.id} pairing={pairing} />
        ))}
      </main>
    </div>
  );
}
