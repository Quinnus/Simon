export default function ConfirmQuitModal({ exitToSummary, handleResumeGame }) {
    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <p>Are you sure you want to quit?</p>

                    <button className="quit-rejected" onClick={handleResumeGame}>
                        <span>No</span>
                    </button>
                    <button className="quit-confirmed" onClick={exitToSummary}>
                        <span>Yes</span>
                    </button>
                </div>
            </div>
        </>
    );
}
