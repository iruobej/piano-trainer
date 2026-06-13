//Theory Layer
export type Triad = "major" | "minor" | "dim" | "aug" | "sus2" | "sus4";

// | means union
export type Seventh =
  | "maj7"
  | "min7"
  | "dom7"
  | "dim7"
  | "halfdim7"
  | "minMaj7";

export type Extension = "9" | "11" | "13";

export type ChordModel = {
  triad: Triad;
  seventh?: Seventh;
  extension?: Extension;

  include9?: boolean;
  include11?: boolean;
};
   

  export type Chord = {
    name: string;
    notes: string[];
  }
 
  const TRIADS: Record<Triad, number[]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
  };

  const SEVENTHS: Record<Seventh, number> = {
    maj7: 11,
    min7: 10,
    dom7: 10,
    dim7: 9,
    halfdim7: 10,
    minMaj7: 11,
  };

  const EXTENSIONS: Record<Extension, number> = {
    "9": 14,
    "11": 17,
    "13": 21,
  };


  // UI Layer - chord names that the user will see
  export type ChordName =
  | "major"
  | "minor"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "7"
  | "aug7"
  | "maj7"
  | "min7"
  | "dim7"
  | "halfdim7"
  | "minMaj7"
  | "9"
  | "maj9"
  | "min9"
  | "11"
  | "maj11"
  | "min11"
  | "13"
  | "maj13"
  | "min13";

  // Convert UI Names to names understood by the code
  export const chordMap: Record<ChordName, ChordModel> = {
    // triads
    major: { triad: "major" },
    minor: { triad: "minor" },
    dim: { triad: "dim" },
    aug: { triad: "aug" },
    sus2: { triad: "sus2" },
    sus4: { triad: "sus4" },

    // sevenths
    maj7: { triad: "major", seventh: "maj7" },
    min7: { triad: "minor", seventh: "min7" },
    "7": { triad: "major", seventh: "dom7" },

    aug7: { triad: "aug", seventh: "dom7" },
    dim7: { triad: "dim", seventh: "dim7" },
    halfdim7: { triad: "dim", seventh: "halfdim7" },
    minMaj7: { triad: "minor", seventh: "minMaj7" },

    // extensions
    "9": { triad: "major", seventh: "dom7", extension: "9" },
    maj9: { triad: "major", seventh: "maj7", extension: "9" },
    min9:  { triad: "minor", seventh: "min7", extension: "9" },


    "11": { triad: "major", seventh: "dom7", extension: "11" },
    maj11: { triad: "major", seventh: "maj7", extension: "11" },
    min11:  { triad: "minor", seventh: "min7", extension: "11" },

    "13": { triad: "major", seventh: "dom7", extension: "13" },
    maj13: { triad: "major", seventh: "maj7", extension: "13" },
    min13:  { triad: "minor", seventh: "min7", extension: "13" },
  };

  export function buildChordModel(model: ChordModel): number[] {
    const notes: number[] = [...TRIADS[model.triad]];

    // enforce harmony rule: extensions imply 7th
    if (model.extension && !model.seventh) {
      // Unless explicitly stated, extensions assume a maj 7th as part of the chord
      if (model.triad === "minor") {
        model.seventh = "min7";
      } else {
        model.seventh = "maj7";
      }
    }

    if (model.seventh) {
      notes.push(SEVENTHS[model.seventh]);
    }

    if (model.extension) {
      notes.push(EXTENSIONS[model.extension]);

      if (model.include9 && model.extension !== "9") {
        notes.push(EXTENSIONS["9"]);
      }

      if (model.include11 && model.extension === "13") {
        notes.push(EXTENSIONS["11"]);
      }
    }

    return notes;
  }

  //all 12 notes of scale
  export const notes = ["C", "C#", "D", "E♭", "E", "F", "F#", "G", "A♭", "A", "B♭", "B"];

  export function getChord(root: string, name: ChordName): string[] {
    const rootIndex = notes.indexOf(root);

    return buildChordModel(chordMap[name]).map(interval =>
      notes[(rootIndex + interval) % 12]
    );
  }

  // Generate a random chord (this is what will be displayed)
  export function getRandomChord(selectedChords: Set<ChordName>): Chord {
    // Pick a random root note
    const root = notes[Math.floor(Math.random() * notes.length)];

    // Randomly pick a chord type
    function getRandomChordType(): ChordName{
      const types = Array.from(selectedChords);
      return types[Math.floor(Math.random() * types.length)]; //e.g. types[Math.floor(0.34 * 10)] = types[3] = aug
    }

    const type: ChordName = getRandomChordType();
    //console.log(type);

    return {
      name: `${root} ${type}`,     // e.g. "E minor"
      notes: getChord(root, type) // e.g. ["E", "G", "B"]   
    };
  }


  