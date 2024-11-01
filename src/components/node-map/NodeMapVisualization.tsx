import React, { useMemo } from 'react';
import ReactFlow, { 
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Deck } from '../../types/deck';
import DeckNode from './DeckNode';
import FlashcardNode from './FlashcardNode';

interface NodeMapVisualizationProps {
  decks: Deck[];
}

const NodeMapVisualization: React.FC<NodeMapVisualizationProps> = ({ decks }) => {
  const nodeTypes = useMemo(() => ({
    deckNode: DeckNode,
    flashcardNode: FlashcardNode,
  }), []);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const DECK_SPACING = 800;
    const RADIUS = 250;
    
    console.log('Processing decks:', decks);

    decks.forEach((deck, deckIndex) => {
      console.log(`Processing deck ${deckIndex}:`, deck);
      console.log('Flashcards for this deck:', deck.flashcards);

      // Calculate deck position
      const deckX = deckIndex * DECK_SPACING;
      const deckY = 300;

      // Add deck node
      nodes.push({
        id: deck.id,
        type: 'deckNode',
        position: { x: deckX, y: deckY },
        data: { label: deck.name },
      });

      // Position flashcards in a circle around the deck
      if (deck.flashcards && deck.flashcards.length > 0) {
        deck.flashcards.forEach((flashcard, cardIndex) => {
          console.log(`Processing flashcard ${cardIndex}:`, flashcard);
          
          const flashcardNodeId = `flashcard-${flashcard.id}`;
          const numCards = deck.flashcards?.length || 1;
          const angle = (2 * Math.PI * cardIndex) / numCards;
          
          const flashcardX = deckX + RADIUS * Math.cos(angle);
          const flashcardY = deckY + RADIUS * Math.sin(angle);

          nodes.push({
            id: flashcardNodeId,
            type: 'flashcardNode',
            position: { 
              x: flashcardX, 
              y: flashcardY 
            },
            data: { 
              question: flashcard.question,
              answer: flashcard.answer,
            },
          });

          edges.push({
            id: `edge-${deck.id}-${flashcardNodeId}`,
            source: deck.id,
            target: flashcardNodeId,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#637FBF',
              strokeWidth: 2,
            },
          });
        });
      }
    });

    console.log('Generated nodes:', nodes);
    console.log('Generated edges:', edges);

    return { nodes, edges };
  }, [decks]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.5,
          minZoom: 0.2,
          maxZoom: 1.5,
        }}
        className="bg-[#F8F7F6] dark:bg-gray-800"
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#637FBF', strokeWidth: 2 },
        }}
      >
        <Background color="#637FBF" gap={16} size={1} />
        <Controls className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" />
        <Panel position="bottom-center" className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-t-lg backdrop-blur-sm">
          <div className="text-sm text-black dark:text-white">
            Click cards to flip • Drag to pan • Scroll to zoom
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default NodeMapVisualization;