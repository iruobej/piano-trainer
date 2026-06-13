type Props = {
    lastMistakeChord: string | null;
    lastMistakeNotes: string[];
}
export default function MistakeBox({lastMistakeChord, lastMistakeNotes} : Props) {
    return (
        <div className="infoBox mistakeBox">    
            <h2>Latest Mistake ({lastMistakeChord})</h2>
            <h3>Notes</h3>
            <p>{lastMistakeNotes.join(", ")}</p>
        </div>
    )
}