import { CharacterPairing } from '../types/characterPairing';

export const characterPairings: CharacterPairing[] = [
  {
    id: "cp_louisa_briony_01",
    theme: "The Suppression of Imagination & Childhood",
    functional_equivalence: "Both authors present the deformation of the child's psyche as a consequence of rigid, dogmatic environments designed by adults. Louisa represents the forced starvation of imagination, while Briony represents the toxic over-fermentation of an unregulated imagination detached from social reality.",
    dickens_entity: {
      name: "Louisa Gradgrind",
      system_of_oppression: "Gradgrind's Utilitarian Rationalism / Fact Pedagogy",
      primary_method: "Architectural Metaphor & Light Imagery",
      key_quotes: [
        {
          quote: "A starless wall... [with] no light of Fancy.",
          analysis: "Symbolises the internal darkness created when 'Fancy' (creativity) is extinguished by industrial logic, leaving the child unable to navigate moral complexities."
        },
        {
          quote: "I have been tired... I have been tired a long time.",
          analysis: "The simple, repetitive syntax reflects Louisa's complete emotional exhaustion and the 'starving' of her human heart under her father's system."
        }
      ],
      ao1_sophistication: "Louisa is rendered emotionally inert, unable to navigate human relationships or express agency, because her inner life has been systematically hollowed out."
    },
    mcewan_entity: {
      name: "Briony Tallis",
      system_of_oppression: "Inter-war Upper-Middle-Class Isolation / Country House Novel Privilege",
      primary_method: "Free Indirect Discourse & Greenhouse Metaphor",
      key_quotes: [
        {
          quote: "A passion for secrets... a desire to have a world that she could own.",
          analysis: "Reveals how Briony's imagination is utilized as a tool for narcissistic control rather than empathy, isolating her in a private fantasy world."
        },
        {
          quote: "The imagination was a greenhouse... where things grew too fast and too strange.",
          analysis: "An organic/suffocating metaphor suggesting that without external reality to ground it, the child's mind produces 'unnatural' and dangerous distortions of truth."
        }
      ],
      ao1_sophistication: "Briony projects her dramatic, self-aggrandizing fantasies onto real-world interactions, treating real lives as characters in her private play."
    },
    synthesis: {
      comparative_pivot: "While Louisa is destroyed by a stark deficit of narrative and the cold enforcement of objective facts, Briony destroys others due to a dangerous surplus of narrative and the unchecked imposition of subjective fiction.",
      ao3_context_link: "Louisa's condition critiques the 1854 Utilitarian Revised Code that treated children as industrial resources (tabula rasa), whereas Briony's condition reflects the 1930s inter-war aristocratic nursery—a detached social island that insulated children from the class realities of the working class."
    },
    phase3_critical_lenses: [
      {
        lens_name: "Marxist Reading",
        application: "Louisa is a victim of bourgeois educational engineering designed to produce compliant calculators for industrial capitalism, while Briony's privilege shields her from the material consequences of her actions, which are borne entirely by the working-class Robbie."
      },
      {
        lens_name: "Psychoanalytic Reading (Freudian)",
        application: "Louisa represents the complete repression of the id and emotional desires under a punishing rationalist superego, whereas Briony's pathological need for order represents an obsessive-compulsive defense mechanism against the chaotic intrusion of adult sexuality."
      }
    ]
  },
  {
    id: "cp_hands_soldiers_02",
    theme: "Institutional Mechanization & Anonymity",
    functional_equivalence: "Both authors depict the erasure of the individual by massive institutional machinery—industrial capitalism in Dickens's Victorian landscape and the total war machine/military retreat in McEwan's twentieth-century landscape. Human beings are reduced to anonymous, disposable cogs.",
    dickens_entity: {
      name: "The Coketown Hands",
      system_of_oppression: "Laissez-faire Industrial Capitalism",
      primary_method: "Zoomorphic Metaphor & Anaphora",
      key_quotes: [
        {
          quote: "interminable serpents of smoke... [in] a state of melancholy madness.",
          analysis: "Personification portrays the industrial town as a hellish, repetitive engine of exploitation, turning human life into a monotonous grind."
        },
        {
          quote: "the same sound upon the same pavement... and every day the same thing.",
          analysis: "Mechanical repetition through anaphora emphasizes the erasure of individuality and the reduction of workers to biological parts."
        }
      ],
      ao1_sophistication: "The Hands are stripped of their human identity, defined only by their economic utility and referred to as 'disposable cogs' in the industrial machine."
    },
    mcewan_entity: {
      name: "The Dunkirk Soldiers / Bodies",
      system_of_oppression: "The Total War Machine / Military Hierarchy",
      primary_method: "Forensic Imagery & Apocalyptic Pastiche",
      key_quotes: [
        {
          quote: "A dead civilisation... first his own life ruined, then everybody else's.",
          analysis: "Sensory descriptions of the battlefield depict the total collapse of societal structures, human values, and individual agency."
        },
        {
          quote: "legs and arms... scattered like firewood... no names, no markers.",
          analysis: "Deconstructive description of dead bodies reflects the ultimate objectification and fragmentation of human beings under the military apparatus."
        }
      ],
      ao1_sophistication: "The soldiers are denied individual heroism or narratives; they are presented as fragmented, biological debris in a state of systemic collapse."
    },
    synthesis: {
      comparative_pivot: "While Dickens uses the monotonous, repetitive grind of the Victorian factory town to satirise the slow, systemic erasure of individual souls, McEwan employs the chaotic, forensic carnage of Dunkirk to expose the sudden, violent objectification of human bodies by modern warfare.",
      ao3_context_link: "The exploitation of the Hands reflects the 1850s Laissez-faire economics and Malthusian population theories that viewed the poor as surplus population, whereas the Dunkirk retreat represents the physical collapse of the British Empire's class-bound military hierarchy and the loss of nineteenth-century 'heroic' narratives."
    },
    phase3_critical_lenses: [
      {
        lens_name: "Marxist Reading",
        application: "The Hands are the classic alienated proletariat whose labor and humanity are commodified by industrial capitalism. Similarly, the Dunkirk soldiers are working-class conscripts sacrificed on the altar of imperial war, their bodies literally devalued to maintain the bourgeois state."
      },
      {
        lens_name: "Post-Colonial Reading",
        application: "Dickens's use of 'imperial gallons' suggests a colonial-style conquest of the domestic working-class mind. In Atonement, the chaotic retreat from Dunkirk serves as a physical deconstruction of the British imperial myth, exposing the moral bankruptcy of an empire collapsing under its own weight."
      }
    ]
  },
  {
    id: "cp_gradgrind_novelist_03",
    theme: "Narrative Control, Moral Certainty, and Guilt",
    functional_equivalence: "Both figures represent creators/authorial gods who seek to impose rigid, absolute ordering systems onto reality to maintain control, only to face the collapse of their systems and the subsequent burden of moral responsibility and guilt.",
    dickens_entity: {
      name: "Thomas Gradgrind",
      system_of_oppression: "Victorian Rationalism / Empirical Certainty",
      primary_method: "Satirical Caricature & Geometric Motifs",
      key_quotes: [
        {
          quote: "What I want is, Facts... Teach these boys and girls nothing but Facts.",
          analysis: "Imperative tone establishes Victorian omniscient authority and absolute confidence in objective data."
        },
        {
          quote: "The key to the room is in my desk... But the key to the human heart is not.",
          analysis: "Symbolic admission of the failure of his rationalist system to account for human emotion, empathy, and morality."
        }
      ],
      ao1_sophistication: "Gradgrind's journey represents the collapse of dogmatic Victorian moral certainty when confronted with the emotional ruin of his children, forcing him to accept the 'muddle' of human life."
    },
    mcewan_entity: {
      name: "Older Briony / The Novelist",
      system_of_oppression: "Postmodern Metafiction / Secular Self-Judgment",
      primary_method: "Metafictional Disclosure & Frame Narrative",
      key_quotes: [
        {
          quote: "I gave them their happiness... in my thoughts.",
          analysis: "The final metafictional reveal deconstructs the reader's trust, highlighting that the entire narrative is a constructed lie."
        },
        {
          quote: "There is no one, no entity or higher form... to grant her a pardon.",
          analysis: "Establishes the secular postmodern problem: the author is the 'creator-god' who cannot be forgiven by her own creations."
        }
      ],
      ao1_sophistication: "Older Briony uses narrative not to establish truth, but to attempt 'atonement' for her crime, creating a self-serving literary consolation while acknowledging her final unreliability."
    },
    synthesis: {
      comparative_pivot: "While Dickens allows Gradgrind a traditional Victorian restoration where he abandons his rigid logic in favor of the 'human heart' and moral redemption, McEwan's postmodern framework denies Older Briony true absolution, presenting her metafictional penance as an endless, circular loop of guilt.",
      ao3_context_link: "Gradgrind's absolute certainty is rooted in Victorian empiricism and the belief in progress, whereas Older Briony's recursive guilt reflects the postmodern crisis of truth and secularization, where grand narratives have collapsed and language itself cannot provide redemption."
    },
    phase3_critical_lenses: [
      {
        lens_name: "Psychoanalytic Reading",
        application: "Gradgrind's dogmatic system is a defense mechanism against emotional intimacy and vulnerability. In contrast, Older Briony's entire novel is a sublimation of her trauma and guilt, a compulsive attempt to undo the past through symbolic repetition."
      },
      {
        lens_name: "Postmodernist Reading",
        application: "Gradgrind represents the nineteenth-century realist belief in a stable, external referent (the 'Fact'). Older Briony represents the postmodern turn where reality is permanently deferred, existing only as a series of unstable, self-referential texts ('metafiction')."
      }
    ]
  }
];
