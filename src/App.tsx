// Everything that affects the UI is in this file
import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.tsx';
import useMidi from './externalFiles/useMidi.ts';
import useGameLogic from './externalFiles/useGameLogic.ts';
import type { ChordType } from "./externalFiles/musicTheory.ts";
import { chordTypes } from "./externalFiles/musicTheory.ts";
import usePlayerData from './externalFiles/playerLogic.ts';

function App() {
  // Notes the user is currently playing
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [midiMessage, setMIDIMessage] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  // Track player's score 
  const [score, setScore] = useState(0);
  // To signal when the user is finishing a session
  const [finished, setFinished] = useState(true);
  const {playerData, setPlayerData} = usePlayerData();

  //timer value after which a new chord is generated
  const [selectedNumber, setSelectedNumber] = useState(5);
  

  const [selectedChords, setSelectedChords] = useState<Set<ChordType>>(
    new Set(Object.keys(chordTypes) as ChordType[])
  )

  const {
    chord,
    uniquePlayed,
    resultMessage,
    countdownNumber,
    setRunning,
    generateChord
  } = useGameLogic({
    activeNotes,
    selectedNumber,
    selectedChords,
    setScore
  });

  
  //MIDI logic
  useMidi({setActiveNotes, setMIDIMessage, setConnected, setFinished, setRunning, setScore});

  

  // Modifying chords selected when user selects/deselects a chord
  function toggleChord(chord: ChordType) {
    setSelectedChords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(chord)) {
          newSet.delete(chord);
        } else {
          newSet.add(chord);
        }
      return newSet;
    });
  }

  function isolateChord(chord: ChordType) {
    setSelectedChords(prev => {
      const newSet = [...prev];
      const filtered =  newSet.filter(x => x === chord);
      const filteredSet = new Set(filtered);
      return filteredSet;
    })
  }

  
  
  return (
    <>
      <Navbar/>
      <div>
        {connected && <p>Highscore: {playerData.highscore}</p>}
        {connected && <p>Score: {score}</p>}
        <h1>Chord</h1>
        {/* Show chord name */}
        <p className='chordName'>
          {Array.from(selectedChords).length <= 0 ? "No Chord Types Selected" : chord ? chord.name : "Press Start"}
        </p>

        {connected && <p>Notes you are playing: [ {uniquePlayed.join(", ")} ]</p>}


        {connected && <h2>{resultMessage}</h2>}

        <h1></h1>

        <h3>Time left: {countdownNumber}</h3>

        <h2>Set time:</h2>
        <select 
          value={selectedNumber}
          onChange={(e) => setSelectedNumber(Number(e.target.value))}
        >
          {[...Array(60).keys()].map(i => (
            <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
          ))}
        </select>

        <p>Selected time: {selectedNumber} seconds</p>
        {/* Button to get a new chord */}
        <button className={finished ? "startButton" : "finishButton"} onClick={() => {
          // Because setFinished(!finished) doesnt update immediately, must assign to variable and use that instead (nextFinished)
          const nextFinished = !finished; 
          setFinished(nextFinished);

          if (nextFinished) {
            //Stop timer
            setRunning(false);
            if (score > playerData.highscore) {
              setPlayerData(prev => ({
                ...prev,
                highscore: score
              }));
            }
            setScore(0);
          } else {if (selectedChords.size > 0) generateChord();}
        }}>

          {finished? "Start" : "Finish"}
        </button>
        <p><i className="fa-solid fa-circle-info"></i> {midiMessage}</p>

        {/*Checkbox list - allows users to choose what chords they want to be tested on */}
        {(Object.keys(chordTypes) as ChordType[]).map(c => (
          <div key={c}>
            <label htmlFor={c}>{c}</label>
            <input type="checkbox" 
              name={c} 
              value={c} 
              id={c} 
              checked={selectedChords.has(c)} 
              onChange={() => toggleChord(c)}
              //handling right click event
              onContextMenu={(e) => {
                e.preventDefault(); //stops default menu coming up
                isolateChord(c);
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default App
