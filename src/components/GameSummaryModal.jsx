export default function GameSummaryModal({ exitAndShutDown, streak }) {
    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <p>Your Streak was: {streak}</p>
                    <p>Play Again Soon!</p>
                    <button className="exit-to-start" onClick={exitAndShutDown}>
                        <span>Restart</span>
                    </button>
                </div>
            </div>
        </>
    );
}
