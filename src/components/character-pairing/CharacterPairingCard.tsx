import React from 'react';
import { CharacterPairing } from '../../types/characterPairing';

interface Props {
  pairing: CharacterPairing;
}

export const CharacterPairingCard: React.FC<Props> = ({ pairing }) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900 text-slate-100 rounded-xl shadow-2xl overflow-hidden border border-slate-700 font-sans">
      
      {/* Header Section */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Phase 3: Character Pairing</div>
        <h2 className="text-2xl font-bold mb-3">{pairing.theme}</h2>
        <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-300 uppercase mb-1">Functional Equivalence</h3>
          <p className="text-slate-200 leading-relaxed">{pairing.functional_equivalence}</p>
        </div>
      </div>

      {/* Split Comparison Section */}
      <div className="flex flex-col md:flex-row">
        
        {/* Dickens Side */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-700 bg-amber-950/20">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-2 py-1 bg-amber-900/50 text-amber-300 text-xs font-semibold rounded uppercase tracking-wider">Hard Times</span>
            <h3 className="text-xl font-bold text-amber-100">{pairing.dickens_entity.name}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">System of Oppression</span>
              <p className="font-medium text-amber-200/90">{pairing.dickens_entity.system_of_oppression}</p>
            </div>
            
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Primary Method</span>
              <p className="font-medium text-slate-300">{pairing.dickens_entity.primary_method}</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Key Quote</span>
              <blockquote className="italic border-l-2 border-amber-500 pl-3 text-slate-300 mb-2">
                "{pairing.dickens_entity.key_quotes[0]?.quote}"
              </blockquote>
              <p className="text-sm text-slate-400">{pairing.dickens_entity.key_quotes[0]?.analysis}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">AO1 Sophistication</span>
              <p className="text-sm text-slate-300 leading-relaxed">{pairing.dickens_entity.ao1_sophistication}</p>
            </div>
          </div>
        </div>

        {/* McEwan Side */}
        <div className="flex-1 p-6 bg-cyan-950/20">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 text-xs font-semibold rounded uppercase tracking-wider">Atonement</span>
            <h3 className="text-xl font-bold text-cyan-100">{pairing.mcewan_entity.name}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">System of Oppression</span>
              <p className="font-medium text-cyan-200/90">{pairing.mcewan_entity.system_of_oppression}</p>
            </div>
            
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Primary Method</span>
              <p className="font-medium text-slate-300">{pairing.mcewan_entity.primary_method}</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Key Quote</span>
              <blockquote className="italic border-l-2 border-cyan-500 pl-3 text-slate-300 mb-2">
                "{pairing.mcewan_entity.key_quotes[0]?.quote}"
              </blockquote>
              <p className="text-sm text-slate-400">{pairing.mcewan_entity.key_quotes[0]?.analysis}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">AO1 Sophistication</span>
              <p className="text-sm text-slate-300 leading-relaxed">{pairing.mcewan_entity.ao1_sophistication}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Synthesis & AO5 Section */}
      <div className="p-6 bg-slate-900 border-t border-slate-700 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-5">
             <h3 className="text-sm font-semibold text-emerald-400 uppercase mb-2 flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
               Comparative Pivot (AO4)
             </h3>
             <p className="text-slate-300 leading-relaxed text-sm">{pairing.synthesis.comparative_pivot}</p>
          </div>
          
          <div className="bg-purple-950/20 border border-purple-900/50 rounded-lg p-5">
             <h3 className="text-sm font-semibold text-purple-400 uppercase mb-2 flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
               Critical Lenses (Phase 3)
             </h3>
             {pairing.phase3_critical_lenses.map((lens, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                  <span className="font-medium text-purple-300 text-sm">{lens.lens_name}:</span>
                  <span className="text-slate-300 text-sm ml-2">{lens.application}</span>
                </div>
             ))}
          </div>
        </div>

      </div>

    </div>
  );
};
