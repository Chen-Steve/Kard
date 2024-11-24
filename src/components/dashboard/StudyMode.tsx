import FlashcardComponent from './Flashcard';

interface StudyModeProps {
  userId: string;
  deckId: string;
  decks: any[];
}

const StudyMode = ({ userId, deckId, decks }: StudyModeProps) => {
  return (    
    <div className="w-full px-4 sm:px-10 mt-20 sm:mt-32">
        <FlashcardComponent
            userId={userId}
            deckId={deckId}
            decks={decks}
            onDeckChange={() => {}}
            showFlashcardList={false}
            showDefinitions={true}
            isStudyMode={true}
        />
    </div>
  );
};

export default StudyMode; 