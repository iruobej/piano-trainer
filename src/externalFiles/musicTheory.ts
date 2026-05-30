// | means union
  export type ChordType = 
    | "major"
    | "minor"
    | "dim"
    | "aug"
    | "sus2"
    | "sus4"
    | "maj7"
    | "min7"
    | "aug7"
    | "7"
    | "dim7"
    | "halfdim7"
    | "minMaj7";

  export type Chord = {
    name: string;
    notes: string[];
  }

  export const chordTypes: Record<ChordType, number[]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7], 
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    maj7: [0, 4, 7, 11], 
    min7: [0, 3, 7, 10], 
    aug7: [0, 4, 8, 10], 
    "7": [0, 4, 7, 10], 
    dim7: [0, 3, 6, 9], 
    halfdim7: [0, 3, 6, 10],
    minMaj7: [0, 3, 7, 11]
  };

  //all 12 notes of scale
  export const notes = ["C", "C#", "D", "E♭", "E", "F", "F#", "G", "A♭", "A", "B♭", "B"];

  //Build a chord from a root note (from notes array) and type (from chordTypes)
  export function getChord(root: string, type: ChordType) : string[] {
    // Find the index of the root note
    const rootIndex = notes.indexOf(root);

    // Create the chord notes using the intervals
    return chordTypes[type].map((interval:number) => {
      // Add interval and wrap around if needed
      // Wrap around to keep midi notes above 12 in the same octave
      const index = (rootIndex + interval) % 12;

      // Return the note at that position
      return notes[index];
    });
  }
  // Generate a random chord (this is what will be displayed)
  export function getRandomChord(selectedChords: Set<ChordType>): Chord {
    // Pick a random root note
    const root = notes[Math.floor(Math.random() * notes.length)];

    // Randomly pick a chord type
    function getRandomChordType(): ChordType{
      const types = Array.from(selectedChords);
      return types[Math.floor(Math.random() * types.length)]; //e.g. types[Math.floor(0.34 * 10)] = types[3] = aug
    }

    const type: ChordType = getRandomChordType();
    return {
      name: `${root} ${type}`,     // e.g. "E minor"
      notes: getChord(root, type) // e.g. ["E", "G", "B"]
    };
  }

  