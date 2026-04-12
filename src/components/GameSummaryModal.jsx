export default function GameSummaryModal({ exitAndShutDown }) {
    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <p>Your Streak was: XXX</p>
                    <p>Play Again Soon!</p>
                    <button className="exit-to-start" onClick={exitAndShutDown}>
                        <span>Shutdown</span>
                    </button>
                </div>
            </div>
        </>
    );
}
