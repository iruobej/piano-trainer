import { useEffect } from "react";
import type React from "react";
type Props = {
    setActiveNotes: React.Dispatch<React.SetStateAction<number[]>>;
    setAttemptNotes: React.Dispatch<React.SetStateAction<number[]>>;
    setMIDIMessage: React.Dispatch<React.SetStateAction<string>>;
    setConnected: React.Dispatch<React.SetStateAction<boolean>>;
    setFinished: React.Dispatch<React.SetStateAction<boolean>>;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
    setScore: React.Dispatch<React.SetStateAction<number>>;
}
export default function useMidi({setActiveNotes, setAttemptNotes, setMIDIMessage, setConnected, setFinished, setRunning, setScore}: Props) {
    // useEffect to constantly check if a midi device has been connected/disconnected
      useEffect(() => {
          //Requesting access to any input that the browser detects
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess()
                .then(success, failure);
        }
    
        // 'midi' displays a MIDIAccess object, the key to recieving midi data
        // The object itself provides an interface to any MIDI devices attached
        function success (midi: MIDIAccess) {
          const updateStatus = () => {
            if (midi.inputs.size < 1) {
              setMIDIMessage("No MIDI device connected");
              setConnected(false);
            } else {
              setMIDIMessage("MIDI Device Connected");
              setConnected(true);
            }
            setFinished(true); //stop the session if a device connects
            setScore(0);
            setRunning(false);
    
            var inputs = midi.inputs.values();
    
            // inputs is an Iterator 
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                // each time there is a midi message call the onMIDIMessage function 
                input.value.onmidimessage = onMIDIMessage;
            }
          }
    
          //Scan for devices immediately
          updateStatus();
    
          //Also scan and update status whenever a new device is connected
          midi.onstatechange = () => {
            updateStatus();
          }
    
          console.log('MIDI connected');
        }
    
        function failure () {
            console.log('No access to your midi devices.');
        }
        
        function onMIDIMessage(message: MIDIMessageEvent) {
          const [status, note, velocity] = message.data!; //! means it is definitely not null
    
          if (status >=240) return; //stops console from logging messages like 254 (sent regularly by keyboard to let browser know its still connected)
    
          // Example: Detect note on (status 144) and note off (status 128)
          // Note ON
          if (status === 144 && velocity > 0) {
              setActiveNotes(prev => {
                  if (prev.includes(note)) return prev; // avoid duplicates
                  return [...prev, note];
              });
              setAttemptNotes(prev => {
                  if (prev.includes(note)) return prev; // avoid duplicates
                  return [...prev, note];
              });
          }
    
          // Note OFF
          if (status === 128 || (status === 144 && velocity === 0)) {
              setActiveNotes(prev => prev.filter(n => n !== note));
          }
        }
      }, []);
    
}