import { useEffect, useState } from "react";
import type React from "react";
import type { ChordType, Chord } from "./musicTheory";
import { notes, getRandomChord } from "./musicTheory";

type Props = {
    activeNotes: number[];
    selectedNumber: number,
    selectedChords: Set<ChordType>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
}

export default function useGameLogic({activeNotes, selectedNumber, selectedChords, setScore}: Props) {
    
    //Controls the countdown timer
    const [running, setRunning] = useState(false);
    
    const [countdownNumber, setCountdownNumber] = useState(selectedNumber);
    const [chord, setChord] = useState<Chord | null>(null);
    //Generating result message for either pass or fail
    const [resultMessage, setResultMessage] = useState<string>("");
    //Handling countdown
  useEffect(() => {
    if (!running) return;

    // Reset countdown for new chord
    setCountdownNumber(Number(selectedNumber));

    const interval = setInterval(() => {
      setCountdownNumber(prev => {
        if (prev <= 0) {
          generateChord();
          return Number(selectedNumber);
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [running, selectedNumber, chord]); // include chord so new chord restarts countdown

  

  const uniquePlayed = activeNotes
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .map(n => notes[n % 12]);
    
  useEffect(() => {
    if (!chord || resultMessage) return; // skip if a resultMessage already has a value and is thus being displayed on screen

    const uniquePlayedSet = new Set(uniquePlayed);
    const expectedSet = new Set(chord.notes);

    const isMatch = 
      uniquePlayedSet.size === expectedSet.size &&
      [...uniquePlayedSet].every(n => expectedSet.has(n))

    if (isMatch) {
      setResultMessage("Correct!");
      //Pause timer
      setRunning(false);
      setScore(prev => prev + 3);
      //Wait 3 seconds before generating new chord
      setTimeout(generateChord, 3000);

      return;
    } else if (!isMatch && countdownNumber === 0){
      setResultMessage("Incorrect.");
      setScore(prev => prev - 1);
    }
  }, [uniquePlayed, chord]);

  // Create a new random chord
  function generateChord() {
    setChord(getRandomChord(selectedChords));
    setCountdownNumber(Number(selectedNumber));
    setRunning(true);

    setResultMessage("");
  }
  return {
    chord,
    uniquePlayed,
    resultMessage,
    countdownNumber,
    running,
    setRunning,
    generateChord
  };
}