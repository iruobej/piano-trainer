type Props = {
    playedNotes: string[];
    actualNotes: string[];
    currentChord: string | null;
}
export default function MistakeBox({playedNotes, actualNotes,  currentChord} : Props) {
    return (
        <div className="infoBox noteHistory">    
            <h2>Note History (for {currentChord})</h2> 
            <p>
                {playedNotes.map((note, index) => (
                    <span 
                        key={index}
                        className={actualNotes.includes(note) ? "correct" : "incorrect"}
                    >
                        <strong>{note}{index < playedNotes.length - 1 ? ", " : ""}</strong>
                    </span>
                ))}
            </p>

        </div>
    )
}