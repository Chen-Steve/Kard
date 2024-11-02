import React, { useMemo, useCallback, useRef, useEffect } from 'react';
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
  NodeChange,
  MarkerType,
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

  // Add a ref to store the previous position of deck nodes
  const prevPositionsRef = useRef<{ [key: string]: { x: number; y: number } }>({});

  // Custom node change handler with position validation
  const handleNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging && change.position) {
        const deckNode = nodes.find(n => n.id === change.id && n.type === 'deckNode');
        if (deckNode) {
          // Initialize previous position if not exists
          if (!prevPositionsRef.current[deckNode.id]) {
            prevPositionsRef.current[deckNode.id] = { ...deckNode.position };
          }

          // Calculate the change in position
          const prevPos = prevPositionsRef.current[deckNode.id];
          const deltaX = change.position.x - prevPos.x;
          const deltaY = change.position.y - prevPos.y;

          // Validate movement speed (limit maximum delta)
          const maxDelta = 50; // Maximum allowed movement per frame
          const validDeltaX = Math.min(Math.max(deltaX, -maxDelta), maxDelta);
          const validDeltaY = Math.min(Math.max(deltaY, -maxDelta), maxDelta);

          // Update the previous position
          prevPositionsRef.current[deckNode.id] = {
            x: prevPos.x + validDeltaX,
            y: prevPos.y + validDeltaY
          };

          // Move all connected flashcards by the validated delta
          const connectedEdges = edges.filter(edge => edge.source === change.id);
          const flashcardIds = connectedEdges.map(edge => edge.target);

          setNodes(nds => 
            nds.map(node => {
              if (node.id === deckNode.id) {
                return {
                  ...node,
                  position: prevPositionsRef.current[deckNode.id]
                };
              }
              if (flashcardIds.includes(node.id)) {
                return {
                  ...node,
                  position: {
                    x: node.position.x + validDeltaX,
                    y: node.position.y + validDeltaY,
                  },
                };
              }
              return node;
            })
          );
        }
      } else if (change.type === 'position' && !change.dragging) {
        // Reset previous position when dragging ends
        if (change.id in prevPositionsRef.current) {
          delete prevPositionsRef.current[change.id];
        }
      }
    });

    onNodesChange(changes);
  }, [nodes, edges, onNodesChange]);

  // Clean up previous positions when component unmounts
  useEffect(() => {
    return () => {
      prevPositionsRef.current = {};
    };
  }, []);

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
        draggable: true,
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
          draggable: true, // Changed to true to allow individual movement
        });

        newEdges.push({
          id: `edge-${deck.id}-${flashcardNodeId}`,
          source: deck.id,
          target: flashcardNodeId,
          type: 'bezier',
          animated: true,
          style: { 
            strokeDasharray: '5,5',
            stroke: '#637FBF',
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#637FBF',
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
          type: 'bezier',
          style: { 
            strokeDasharray: '5,5',
            stroke: '#637FBF', 
            strokeWidth: 2
          }
        }}
      >
        <Background color="#637FBF" gap={16} size={1} />
        <Controls className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm" />
        <Panel position="bottom-center" className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-t-lg backdrop-blur-sm">
          <div className="text-sm text-black dark:text-white">
            Click cards to flip • Drag decks and cards to move • Scroll to zoom
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default NodeMapVisualization;