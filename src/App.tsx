// Everything that affects the UI is in this file
import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.tsx';
import useMidi from './externalFiles/useMidi.ts';
import useGameLogic from './externalFiles/useGameLogic.ts';
import type { ChordName } from "./externalFiles/musicTheory.ts";
import { chordMap } from "./externalFiles/musicTheory.ts";
import usePlayerData from './externalFiles/playerLogic.ts';
import MistakeBox from './components/MistakeBox.tsx';
import NoteHistoryBox from './components/NoteHistoryBox.tsx'

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

  const [attemptNotes, setAttemptNotes] = useState<number[]>([])
  

  const [selectedChords, setSelectedChords] = useState<Set<ChordName>>(
    new Set(Object.keys(chordMap) as ChordName[])
  )

  const {
    chord,
    uniquePlayed,
    attemptedChord,
    resultMessage,
    countdownNumber,
    setRunning,
    generateChord, 
    lastIncorrect, 
  } = useGameLogic({
    activeNotes,
    attemptNotes,
    selectedNumber,
    selectedChords,
    setScore,
    setAttemptNotes
  });

  
  //MIDI logic
  useMidi({setActiveNotes, setAttemptNotes, setMIDIMessage, setConnected, setFinished, setRunning, setScore});

  

  // Modifying chords selected when user selects/deselects a chord
  function toggleChord(chord: ChordName) {
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

  function isolateChord(chord: ChordName) {
    setSelectedChords(prev => {
      const newSet = [...prev];
      const filtered =  newSet.filter(x => x === chord);
      const filteredSet = new Set(filtered);
      return filteredSet;
    })
  }
  function editChordList(chordList: ChordName[]) {
    const filtered =  (Object.keys(chordMap) as ChordName[]).filter(x => chordList.includes(x));
    const filteredSet = new Set(filtered);
    setSelectedChords(filteredSet);
  }

  const roots = ["major", "minor", "dim", "aug", "sus2", "sus4"];
  const sevenths = ["maj7", "min7", "aug7", "dim7", "halfdim7", "minMaj7"]
  const extensions = ["maj9", "min9", "maj11", "min11", "maj13", "min13"]
  
  
  return (
    <>
      <Navbar/>
      <div>
        {connected && <p>Highscore: {playerData.highscore}</p>}
        {connected && <p>Score: {score}</p>}
        
        <div className="horizontal">
          <div className='box'></div>
          <div className='box'>
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
            
          </div>  
          {connected && 
            <div className='box'>
              <NoteHistoryBox
                playedNotes={lastIncorrect ? attemptedChord : []} 
                actualNotes={chord ? chord.notes : []}
                currentChord={chord?.name ?? null}
              ></NoteHistoryBox>
              <MistakeBox 
                lastMistakeChord={lastIncorrect?.name ?? null}
                lastMistakeNotes={lastIncorrect ? lastIncorrect.notes : []}
              ></MistakeBox>    
            </div>
          }
        </div>
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
        <div className="checklist-container">
          <div className="checklist">
            <h3>Root Chords</h3>
            {(roots as ChordName[]).map(c => (
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
          
          <div className="checklist">
            <h3>Sevenths</h3>
            {(sevenths as ChordName[]).map(c => (
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
          
          <div className="checklist">
            <h3>Extensions</h3>
            {(extensions as ChordName[]).map(c => (
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
        </div>
        {/**Button List */}
        <div className="buttonContainer">
          <h3>Presets</h3>
          <div className="buttonList">
            <button onClick={() => editChordList(Object.keys(chordMap) as ChordName[])}>Select All</button>
            <button onClick={() => editChordList(roots as ChordName[])}>Only Roots</button>
            <button onClick={() => editChordList(sevenths as ChordName[])}>Only Sevenths</button>
            <button onClick={() => editChordList(extensions as ChordName[])}>Only Extensions</button>
          </div>
          
        </div>
        
      </div>
    </>
  )
}

export default App
