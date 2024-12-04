import FlashcardComponent from './Flashcard';

interface StudyModeProps {
  userId: string;
  deckId: string;
  decks: any[];
}

const StudyMode = ({ userId, deckId, decks }: StudyModeProps) => {
  const handleDeckChange = () => {
    // Add deck change logic if needed
  };

  return (    
    <div className="w-full px-4 sm:px-10 mt-10 sm:mt-20 min-h-screen">
        <FlashcardComponent
            userId={userId}
            deckId={deckId}
            decks={decks}
            onDeckChange={handleDeckChange}
            showFlashcardList={false}
            showDefinitions={true}
            isStudyMode={true}
            readOnly={true}
        />
    </div>
  );
};

export default StudyMode; 