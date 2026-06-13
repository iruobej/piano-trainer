import { useEffect, useState } from "react";
import type React from "react";
import type { ChordName, Chord } from "./musicTheory";
import { notes, getRandomChord } from "./musicTheory";

type Props = {
    activeNotes: number[];
    attemptNotes: number[];
    selectedNumber: number,
    selectedChords: Set<ChordName>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setAttemptNotes: React.Dispatch<React.SetStateAction<number[]>>;
}


export default function useGameLogic({activeNotes, attemptNotes, selectedNumber, selectedChords, setScore, setAttemptNotes}: Props) {
    // the most recent chord the user got wrong
    const [lastIncorrect, setLastIncorrect] = useState<Chord | null>(null);

    
    // Notes user has played during the current chord
    const [currentInput, setCurrentInput] = useState<string[]>([]);
    // Notes user played from the latest incorrect chord
    const [lastInput, setLastInput] = useState<string[]>([]);
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

  const attemptedChord = attemptNotes
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .map(n => notes[n % 12]);

  // save user's input to currentInput any time they play  
  useEffect(() => {
    if (uniquePlayed.length > 0) {
      setCurrentInput(uniquePlayed);
    }
  }, [uniquePlayed]);  
  
  useEffect(() => {
    if (!chord || resultMessage) return; // skip if a resultMessage already has a value and is thus being displayed on screen

    const uniquePlayedSet = new Set(uniquePlayed);
    const expectedSet = new Set(chord.notes);
    console.log(expectedSet);

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
      setLastIncorrect(chord);
      setLastInput(currentInput);
    }
  }, [uniquePlayed, chord]);

  

  // Create a new random chord
  function generateChord() {
    setChord(getRandomChord(selectedChords));
    setCountdownNumber(Number(selectedNumber));
    setRunning(true);

    setResultMessage("");

    setAttemptNotes([]);
  }
  return {
    chord,
    uniquePlayed,
    attemptedChord, 
    resultMessage,
    countdownNumber,
    running,
    setRunning,
    generateChord,
    lastIncorrect,
    lastInput
  };
}