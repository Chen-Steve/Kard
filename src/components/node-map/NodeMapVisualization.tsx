import React, { useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Panel,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  NodeChange
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

  // Initialize nodes and edges with state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Custom node change handler to move flashcards with their deck
  const handleNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    // Handle regular node changes
    onNodesChange(changes);

    // Handle dragging of deck nodes
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging) {
        const deckNode = nodes.find(n => n.id === change.id && n.type === 'deckNode');
        if (deckNode) {
          // Get all flashcards connected to this deck
          const connectedEdges = edges.filter(edge => edge.source === change.id);
          const flashcardIds = connectedEdges.map(edge => edge.target);

          // Update positions of connected flashcards
          setNodes(nds => 
            nds.map(node => {
              if (flashcardIds.includes(node.id)) {
                // Calculate the relative position from the deck to the flashcard
                const deltaX = node.position.x - (deckNode.position.x || 0);
                const deltaY = node.position.y - (deckNode.position.y || 0);

                // Move flashcard maintaining the same relative position
                return {
                  ...node,
                  position: {
                    x: (change.position?.x || 0) + deltaX,
                    y: (change.position?.y || 0) + deltaY,
                  },
                };
              }
              return node;
            })
          );
        }
      }
    });
  }, [nodes, edges, onNodesChange]);

  // Initialize the nodes and edges when decks change
  useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    const DECK_SPACING = 800;
    const RADIUS = 250;
    
    decks.forEach((deck, deckIndex) => {
      const deckX = deckIndex * DECK_SPACING;
      const deckY = 300;

      // Add deck node
      newNodes.push({
        id: deck.id,
        type: 'deckNode',
        position: { x: deckX, y: deckY },
        data: { label: deck.name },
        draggable: true, // Make deck nodes draggable
      });

      // Position flashcards in a circle around the deck
      deck.flashcards?.forEach((flashcard, cardIndex) => {
        const flashcardNodeId = `flashcard-${flashcard.id}`;
        const numCards = deck.flashcards?.length || 1;
        const angle = (2 * Math.PI * cardIndex) / numCards;
        
        const flashcardX = deckX + RADIUS * Math.cos(angle);
        const flashcardY = deckY + RADIUS * Math.sin(angle);

        newNodes.push({
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
          draggable: false, // Make flashcard nodes non-draggable
        });

        newEdges.push({
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
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [decks, setNodes, setEdges]);

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
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
            Click cards to flip • Drag decks to move • Scroll to zoom
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default NodeMapVisualization;