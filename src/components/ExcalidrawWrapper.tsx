import React, { useState, useEffect } from 'react';
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { FaCircleNotch } from "react-icons/fa";
import { useRouter } from 'next/router';
import { useToast } from "@/components/ui/use-toast";
import supabase from '../lib/supabaseClient';

const ExcalidrawWrapper: React.FC = () => {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('No active session found.');
        router.push('/signin');
        return;
      }
      setUserId(session.user.id);
    };

    getSession();
  }, [router]);

  useEffect(() => {
    if (excalidrawAPI) {
      console.log('excalidrawAPI is now available');
      const testElement = {
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        backgroundColor: 'red',
      };
      excalidrawAPI.updateScene({ elements: [testElement] });
      console.log('Test element added');
    }
  }, [excalidrawAPI]);

  const handleHomeClick = () => {
    router.push('/dashboard');
  };

  // const handleImportDeck = () => {
  //   setIsPopupOpen(true);
  // };

  // const handleDeckSelected = useCallback(async (deckId: string) => {
  //   // ... (commented out implementation)
  // }, [excalidrawAPI, toast]);

  return (
    <div className="w-full h-full relative">
      <Excalidraw
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: true,
            export: false,
            loadScene: true,
            saveToActiveFile: false,
            saveAsImage: false,
          },
        }}
        viewModeEnabled={false}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.Item onSelect={handleHomeClick} icon={<FaCircleNotch size={16} />}>
            Dashboard
          </MainMenu.Item>
          {/* <MainMenu.Item onSelect={handleImportDeck} icon={<FaFolderOpen size={16} />}>
            Import Deck
          </MainMenu.Item> */}
        </MainMenu>
      </Excalidraw>
      {/* {isPopupOpen && userId && (
        <DeckSelectionPopup
          onClose={() => setIsPopupOpen(false)}
          onDeckSelected={handleDeckSelected}
          userId={userId}
        />
      )} */}
    </div>
  );
};

export default ExcalidrawWrapper;