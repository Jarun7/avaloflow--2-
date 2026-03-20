import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ZoomIn, 
  ZoomOut, 
  Undo2, 
  Redo2, 
  Zap, 
  Send, 
  Key, 
  Plus, 
  X, 
  Play,
  Settings as SettingsIcon,
  Loader2,
  Trash2,
  MessageSquare,
  GitBranch,
  Clock,
  Mail,
  Crown,
  Image,
  Film,
  Users,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
  Link2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

interface PostMedia {
  id: string;
  type: 'post' | 'reel' | 'story' | 'collab_post' | 'collab_reel' | 'collab_story';
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  collabWith?: string;
  collabAvatar?: string;
  date: string;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const MOCK_POSTS: PostMedia[] = [
  {
    id: 'p1',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    caption: '🍫 The easiest brownie recipe ever! Drop "BROWNIE" for the full recipe ⬇️',
    likes: 14200,
    comments: 832,
    date: '2 days ago',
  },
  {
    id: 'p2',
    type: 'collab_reel',
    thumbnail: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80',
    caption: '🔥 Collab with @chefjamie — Secret pasta sauce you NEED to try! Comment "PASTA"',
    likes: 28700,
    comments: 1543,
    collabWith: '@chefjamie',
    collabAvatar: 'https://i.pravatar.cc/40?img=12',
    date: '5 days ago',
  },
  {
    id: 'p3',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    caption: '5 kitchen hacks that changed my life 🏆 Comment "HACKS" to get the list!',
    likes: 9400,
    comments: 412,
    date: '1 week ago',
  },
  {
    id: 'p4',
    type: 'collab_post',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    caption: 'Partnered with @nutritionista — Healthy meal prep Sunday 🥗 Comment "PREP" for details!',
    likes: 31000,
    comments: 2100,
    collabWith: '@nutritionista',
    collabAvatar: 'https://i.pravatar.cc/40?img=47',
    date: '2 weeks ago',
  },
  {
    id: 'p5',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
    caption: 'Quick 15-min dinner ideas 🍳 Comment "QUICK" for all the recipes!',
    likes: 7800,
    comments: 289,
    date: '3 weeks ago',
  },
  {
    id: 'p6',
    type: 'collab_reel',
    thumbnail: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80',
    caption: 'Me and @bakingwithsara made a massive choco lava cake 🍰 Comment "LAVA" for the recipe!',
    likes: 52300,
    comments: 3740,
    collabWith: '@bakingwithsara',
    collabAvatar: 'https://i.pravatar.cc/40?img=23',
    date: '1 month ago',
  },
  {
    id: 'p7',
    type: 'story',
    thumbnail: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80',
    caption: '⏰ 24hr only — Comment "DEAL" to get the exclusive link 🔥',
    likes: 6200,
    comments: 347,
    date: '18 hours ago',
  },
  {
    id: 'p8',
    type: 'collab_story',
    thumbnail: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80',
    caption: 'Collab story with @gourmetlife ✨ Swipe up or reply "MENU" for the full menu!',
    likes: 11400,
    comments: 892,
    collabWith: '@gourmetlife',
    collabAvatar: 'https://i.pravatar.cc/40?img=31',
    date: '6 hours ago',
  },
];

const POST_TYPE_LABEL: Record<PostMedia['type'], string> = {
  post: 'Post',
  reel: 'Reel',
  story: 'Story',
  collab_post: 'Collab Post',
  collab_reel: 'Collab Reel',
  collab_story: 'Collab Story',
};

const NODE_TEMPLATES = [
  {
    title: 'Wait / Delay',
    description: 'Pause the flow for a set duration.',
    Icon: Clock,
    config: { menu: 'Wait', text: '5 minutes' },
  },
  {
    title: 'Send Email',
    description: 'Send a follow-up email to the contact.',
    Icon: Mail,
    config: { menu: 'Email', text: '' },
  },
];

interface FlowNode {
  id: string;
  type: 'trigger' | 'action';
  title: string;
  description: string;
  config: any;
}

interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function FlowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
  } | null>(null);
  const draggingLatestPosRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<Array<{
    nodes: FlowNode[];
    positions: Record<string, { x: number; y: number }>;
  }>>([]);
  const historyIndexRef = useRef(-1);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [addAfterNodeId, setAddAfterNodeId] = useState<string | null>(null);
  const [isPostPickerOpen, setIsPostPickerOpen] = useState(false);
  const [postFilterType, setPostFilterType] = useState<'all' | PostMedia['type']>('all');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const [canvasScroll, setCanvasScroll] = useState({ left: 0, top: 0, width: 0, height: 0 });

  // Track canvas scroll/resize for minimap
  useEffect(() => {
    const el = canvasScrollRef.current;
    if (!el) return;
    const update = () => setCanvasScroll({ left: el.scrollLeft, top: el.scrollTop, width: el.clientWidth, height: el.clientHeight });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  // Cancel connect mode on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setConnectingFrom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        if (id === 'premium-follower-check') {
          const premiumFlow = {
            name: 'Comment to DM Follower Check',
            nodes: [
              {
                id: '1',
                type: 'trigger',
                title: 'Instagram Comment',
                description: 'Starts when user comments a specific keyword.',
                config: { keyword: 'brownie', strategy: 'Contains Keyword' }
              },
              {
                id: '2',
                type: 'action',
                title: 'Initial Message & Poll',
                description: 'Thanks user and asks if they follow.',
                config: { menu: 'Interactive Poll', text: 'Thanks for commenting! Are you following us on Instagram/FB/YT? (Yes/No)' }
              },
              {
                id: '3',
                type: 'action',
                title: 'If No: Ask to Follow',
                description: 'Instructs user to follow.',
                config: { menu: 'Direct Message', text: 'Please follow us to get the recipe!' }
              },
              {
                id: '4',
                type: 'action',
                title: 'If Yes: Verify Follower',
                description: 'Checks actual follower status via API.',
                config: { menu: 'Condition', text: 'System checks if user is actually a follower.' }
              },
              {
                id: '5',
                type: 'action',
                title: 'If Not Verified: Apologize & Poll',
                description: 'Tells user they are not a follower and asks again.',
                config: { menu: 'Interactive Poll', text: 'Sorry, you are not a follower yet. Please follow us! Have you followed us now? (Yes/No)' }
              },
              {
                id: '6',
                type: 'action',
                title: 'If Verified: Send Reward',
                description: 'Delivers the promised content.',
                config: { menu: 'Direct Message', text: 'Thanks for following! Here is your brownie recipe: [Link]' }
              }
            ],
            edges: []
          };
          
          const createRes = await fetch('/api/flows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(premiumFlow)
          });
          const newFlow = await createRes.json();
          setFlow(newFlow);
          navigate(`/automations/${newFlow.id}`, { replace: true });
        } else if (id) {
          const response = await fetch(`/api/flows/${id}`);
          if (!response.ok) throw new Error('Failed to fetch flow');
          const flowData = await response.json();
          setFlow(flowData);
        } else {
          // Default flow if none exists
          const defaultFlow = {
            name: 'New Flow',
            nodes: [
              {
                id: '1',
                type: 'trigger',
                title: 'Instagram Keyword',
                description: 'Starts when user sends a specific keyword DM.',
                config: { keyword: 'brownie', strategy: 'Exact Match' }
              },
              {
                id: '2',
                type: 'action',
                title: 'Send Instagram DM',
                description: 'Sends a direct message reply to the user.',
                config: { menu: 'Interactive Menu', text: 'Hey! Thanks for wanting the recipe...' }
              }
            ],
            edges: []
          };
          
          const createRes = await fetch('/api/flows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultFlow)
          });
          const newFlow = await createRes.json();
          setFlow(newFlow);
          navigate(`/automations/${newFlow.id}`, { replace: true });
        }
      } catch (error) {
        console.error('Error fetching flow:', error);
        toast.error('Failed to load flow data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlow();
  }, [id, navigate]);

  // Initialize node positions and history when a flow loads
  useEffect(() => {
    if (flow?.id && flow.nodes.length > 0) {
      const positions: Record<string, { x: number; y: number }> = {};
      flow.nodes.forEach((node, index) => {
        positions[node.id] = { x: 80 + index * 300, y: 150 };
      });
      setNodePositions(positions);

      // Auto-generate sequential edges for flows that have none stored
      if (!flow.edges?.length && flow.nodes.length > 1) {
        const autoEdges: FlowEdge[] = flow.nodes.slice(1).map((node, i) => ({
          id: `e-${flow.nodes[i].id}-${node.id}`,
          source: flow.nodes[i].id,
          target: node.id,
        }));
        setFlow(f => f ? { ...f, edges: autoEdges } : null);
      }

      historyRef.current = [{ nodes: flow.nodes, positions }];
      historyIndexRef.current = 0;
      setHistoryIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.id]);

  const handleSave = async () => {
    if (!flow) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/flows/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flow)
      });
      if (!response.ok) throw new Error('Failed to save flow');
      toast.success('Flow saved successfully');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!flow) return;
    setIsSaving(true);
    try {
      // First save the flow
      await fetch(`/api/flows/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flow)
      });

      // Then create a campaign
      const campaignData = {
        name: flow.name + ' Campaign',
        description: 'Automatically generated campaign for ' + flow.name,
        status: 'active',
        steps: flow.nodes.length,
        stat: '0',
        label: 'Engagements',
        flowId: flow.id
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) throw new Error('Failed to publish campaign');
      toast.success('Flow published as a new Campaign!');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish flow');
    } finally {
      setIsSaving(false);
    }
  };

  const updateNodeConfig = (nodeId: string, key: string, value: any) => {
    if (!flow) return;
    const newNodes = flow.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, config: { ...node.config, [key]: value } };
      }
      return node;
    });
    setFlow({ ...flow, nodes: newNodes });
    pushHistory(newNodes, nodePositions);
  };

  const updateNodeField = (nodeId: string, field: 'title' | 'description', value: string) => {
    if (!flow) return;
    const newNodes = flow.nodes.map(node =>
      node.id === nodeId ? { ...node, [field]: value } : node
    );
    setFlow({ ...flow, nodes: newNodes });
    pushHistory(newNodes, nodePositions);
  };

  const openAddNode = (afterNodeId: string | null = null) => {
    setAddAfterNodeId(afterNodeId);
    setIsAddNodeOpen(true);
  };

  const handleAddNode = (template: typeof NODE_TEMPLATES[0]) => {
    if (!flow) return;
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type: 'action',
      title: template.title,
      description: template.description,
      config: { ...template.config },
    };
    const insertAfterIndex = addAfterNodeId
      ? flow.nodes.findIndex(n => n.id === addAfterNodeId)
      : flow.nodes.length - 1;
    const newNodes = [...flow.nodes];
    newNodes.splice(insertAfterIndex + 1, 0, newNode);
    const prevNode = flow.nodes[insertAfterIndex];
    const prevPos = (prevNode && nodePositions[prevNode.id]) || { x: 80, y: 150 };
    const newPositions = { ...nodePositions, [newNode.id]: { x: prevPos.x + 300, y: prevPos.y } };
    // Add an edge from the source node to the new node
    const newEdge: FlowEdge | null = addAfterNodeId
      ? { id: `e-${addAfterNodeId}-${newNode.id}-${Date.now()}`, source: addAfterNodeId, target: newNode.id }
      : null;
    const newEdges = newEdge ? [...(flow.edges || []), newEdge] : (flow.edges || []);
    setFlow({ ...flow, nodes: newNodes, edges: newEdges });
    setNodePositions(newPositions);
    pushHistory(newNodes, newPositions);
    setSelectedNodeId(newNode.id);
    setIsAddNodeOpen(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!flow) return;
    if (flow.nodes.length <= 1) {
      toast.error('Cannot delete the only node');
      return;
    }
    const newNodes = flow.nodes.filter(n => n.id !== nodeId);
    const newPositions = { ...nodePositions };
    delete newPositions[nodeId];
    // Remove all edges referencing this node
    const newEdges = (flow.edges || []).filter(e => e.source !== nodeId && e.target !== nodeId);
    setFlow({ ...flow, nodes: newNodes, edges: newEdges });
    setNodePositions(newPositions);
    pushHistory(newNodes, newPositions);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleConnect = (targetId: string) => {
    if (!flow || !connectingFrom) return;
    if (connectingFrom === targetId) { setConnectingFrom(null); return; }
    const exists = flow.edges?.some(e => e.source === connectingFrom && e.target === targetId);
    if (exists) {
      toast.error('Connection already exists');
      setConnectingFrom(null);
      return;
    }
    const newEdge: FlowEdge = {
      id: `e-${connectingFrom}-${targetId}-${Date.now()}`,
      source: connectingFrom,
      target: targetId,
    };
    setFlow({ ...flow, edges: [...(flow.edges || []), newEdge] });
    toast.success('Nodes connected!');
    setConnectingFrom(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    if (!flow) return;
    setFlow({ ...flow, edges: flow.edges.filter(e => e.id !== edgeId) });
  };

  const handleTestFlow = async () => {
    if (!flow) return;
    setIsSaving(true);
    try {
      // Create a test activity log
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Test Run: ${flow.name}`,
          desc: `Successfully executed test run for flow.`,
          icon: 'Play',
          color: 'bg-emerald-500',
          category: 'Testing'
        })
      });
      toast.success('Test run successful!', {
        description: 'Check the activity feed for details.'
      });
    } catch (error) {
      console.error('Error testing flow:', error);
      toast.error('Failed to execute test run');
    } finally {
      setIsSaving(false);
    }
  };

  const pushHistory = (
    nodes: FlowNode[],
    positions: Record<string, { x: number; y: number }>
  ) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({ nodes, positions });
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      const state = historyRef.current[newIndex];
      setFlow(f => (f ? { ...f, nodes: state.nodes } : null));
      setNodePositions(state.positions);
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      const state = historyRef.current[newIndex];
      setFlow(f => (f ? { ...f, nodes: state.nodes } : null));
      setNodePositions(state.positions);
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(parseFloat((z + 0.1).toFixed(1)), 2.0));
  const handleZoomOut = () => setZoom(z => Math.max(parseFloat((z - 0.1).toFixed(1)), 0.25));

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const pos = nodePositions[nodeId];
    if (!pos) return;
    draggingLatestPosRef.current = null;
    setDraggingNode({
      id: nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: pos.x,
      startNodeY: pos.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode) return;
    const dx = (e.clientX - draggingNode.startMouseX) / zoom;
    const dy = (e.clientY - draggingNode.startMouseY) / zoom;
    const newX = draggingNode.startNodeX + dx;
    const newY = draggingNode.startNodeY + dy;
    draggingLatestPosRef.current = { x: newX, y: newY };
    setNodePositions(prev => ({ ...prev, [draggingNode.id]: { x: newX, y: newY } }));
  };

  const handleCanvasMouseUp = () => {
    if (draggingNode && flow) {
      const latestPos = draggingLatestPosRef.current;
      const finalPositions = latestPos
        ? { ...nodePositions, [draggingNode.id]: latestPos }
        : nodePositions;
      pushHistory(flow.nodes, finalPositions);
      draggingLatestPosRef.current = null;
    }
    setDraggingNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex -m-4 md:-m-8 h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Automation Canvas */}
      <div className="flex-grow relative bg-surface-bright canvas-grid overflow-hidden">
        {/* Connect Mode Banner */}
        {connectingFrom && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-primary text-white px-5 py-2.5 rounded-full shadow-xl shadow-primary/30 text-sm font-bold pointer-events-auto">
            <Link2 className="w-4 h-4 flex-shrink-0" />
            <span>Click a node to connect from <em>"{flow?.nodes.find(n => n.id === connectingFrom)?.title}"</em></span>
            <button onClick={() => setConnectingFrom(null)} className="p-0.5 hover:bg-white/20 rounded-full ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Canvas Toolbar (Floating) */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1 md:gap-2 bg-white/90 p-1 md:p-1.5 rounded-xl shadow-lg border border-outline-variant/10 z-10">
          <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 md:p-2 hover:bg-surface-container transition-colors rounded-lg text-on-surface-variant"><ZoomIn className="w-4 h-4 md:w-5 md:h-5" /></button>
          <span className="text-[10px] font-bold text-on-surface-variant px-0.5 select-none tabular-nums">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 md:p-2 hover:bg-surface-container transition-colors rounded-lg text-on-surface-variant"><ZoomOut className="w-4 h-4 md:w-5 md:h-5" /></button>
          <div className="w-px h-5 md:h-6 bg-outline-variant/20 self-center"></div>
          <button onClick={handleUndo} disabled={historyIndex <= 0} title="Undo" className="p-1.5 md:p-2 hover:bg-surface-container transition-colors rounded-lg text-on-surface-variant disabled:opacity-40"><Undo2 className="w-4 h-4 md:w-5 md:h-5" /></button>
          <button onClick={handleRedo} disabled={historyIndex >= historyRef.current.length - 1} title="Redo" className="p-1.5 md:p-2 hover:bg-surface-container transition-colors rounded-lg text-on-surface-variant disabled:opacity-40"><Redo2 className="w-4 h-4 md:w-5 md:h-5" /></button>
        </div>

        {/* Flow Nodes Canvas */}
        <div
          ref={canvasScrollRef}
          className="absolute inset-0 overflow-auto"
          style={{ cursor: draggingNode ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onClick={() => { if (connectingFrom) setConnectingFrom(null); }}
        >
          <div
            className="relative"
            style={{ width: '3000px', height: '1800px', transform: `scale(${zoom})`, transformOrigin: '0 0' }}
          >
            {/* SVG Connectors — edge-based, supports multiple outputs per node */}
            <svg className="absolute inset-0 pointer-events-none" width="3000" height="1800">
              {(flow?.edges || []).map(edge => {
                const sourcePos = nodePositions[edge.source];
                const targetPos = nodePositions[edge.target];
                if (!sourcePos || !targetPos) return null;
                const nodeWidth = 256;
                const nodeHeight = 180;
                const x1 = sourcePos.x + nodeWidth;
                const y1 = sourcePos.y + nodeHeight / 2;
                const x2 = targetPos.x;
                const y2 = targetPos.y + nodeHeight / 2;
                const cx = (x1 + x2) / 2;
                return (
                  <path
                    key={`edge-${edge.id}`}
                    d={`M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`}
                    stroke="#0058c3"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                );
              })}
            </svg>

            {/* Draggable Nodes */}
            {flow?.nodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 80, y: 150 };
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  className="absolute select-none"
                  style={{ left: pos.x, top: pos.y, cursor: connectingFrom ? 'crosshair' : draggingNode?.id === node.id ? 'grabbing' : 'grab' }}
                  onMouseDown={(e) => { if (!connectingFrom) handleNodeMouseDown(e, node.id); }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingFrom) {
                      handleConnect(node.id);
                    } else {
                      setSelectedNodeId(node.id);
                    }
                  }}
                >
                  <div className={cn(
                    "w-64 bg-white rounded-2xl shadow-xl p-5 relative z-10 transition-all",
                    node.type === 'trigger'
                      ? "border-2 border-primary ring-4 ring-primary/5"
                      : "border border-outline-variant/15 shadow-lg",
                    isSelected && !connectingFrom && "ring-4 ring-primary/30 border-primary",
                    connectingFrom && connectingFrom !== node.id && "ring-2 ring-emerald-400/50 hover:ring-emerald-500 hover:ring-4",
                    connectingFrom === node.id && "ring-4 ring-primary border-primary opacity-80"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full",
                        node.type === 'trigger' ? "bg-primary/10 text-primary" : "bg-surface-container-highest text-primary"
                      )}>
                        {node.type}
                      </span>
                      {node.type === 'trigger' ? (
                        <Zap className="w-5 h-5 text-primary fill-current" />
                      ) : (
                        <Send className="w-5 h-5 text-primary fill-current" />
                      )}
                    </div>
                    <h3 className="font-headline font-bold text-on-surface mb-1 text-base">{node.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{node.description}</p>

                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/15">
                      {node.type === 'trigger' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <Key className="w-4 h-4" />
                            <span className="text-sm">"{node.config.keyword}"</span>
                          </div>
                          {node.config?.selectedPost && (
                            <div className="flex items-center gap-2 mt-1.5 bg-amber-400/10 rounded-lg px-2 py-1.5">
                              <img
                                src={node.config.selectedPost.thumbnail}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5 text-amber-500 fill-current flex-shrink-0" />
                                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">{POST_TYPE_LABEL[node.config.selectedPost.type as PostMedia['type']]}</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant truncate">{node.config.selectedPost.caption}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span className="text-[11px] font-bold text-on-surface">{node.config.menu}</span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate italic">"{node.config.text}"</div>
                        </div>
                      )}
                    </div>

                    {/* Connector Points */}
                    {node.type === 'trigger' ? (
                      <div
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setConnectingFrom(node.id); toast('Click another node to connect'); }}
                        title="Connect from this node"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-outline-variant/20 shadow-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-outline-variant rounded-full"></div>
                        </div>
                        <div
                          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-outline-variant/20 shadow-sm flex items-center justify-center cursor-pointer hover:bg-emerald-500 hover:border-emerald-500 transition-colors group"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); setConnectingFrom(node.id); toast('Click another node to connect'); }}
                          title="Connect to another node"
                        >
                          <Link2 className="w-3 h-3 text-outline-variant group-hover:text-white" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MiniMap (Bottom Left - Hidden on small screens) */}
        {(() => {
          const CANVAS_W = 3000;
          const CANVAS_H = 1800;
          const MAP_W = 144;
          const MAP_H = 96;
          const sx = MAP_W / CANVAS_W;
          const sy = MAP_H / CANVAS_H;
          const nodeW = 256 * sx;
          const nodeH = 180 * sy;
          // Viewport rect in minimap coords
          const vpLeft = Math.max(0, (canvasScroll.left / zoom) * sx);
          const vpTop = Math.max(0, (canvasScroll.top / zoom) * sy);
          const vpW = Math.min(MAP_W - vpLeft, (canvasScroll.width / zoom) * sx);
          const vpH = Math.min(MAP_H - vpTop, (canvasScroll.height / zoom) * sy);
          return (
            <div className="hidden sm:block absolute bottom-6 left-6 w-40 h-28 bg-white/60 backdrop-blur border border-outline-variant/15 rounded-2xl shadow-lg p-2">
              <div className="w-full h-full bg-surface-dim/40 rounded-xl relative overflow-hidden" style={{ width: MAP_W, height: MAP_H }}>
                {/* Node dots */}
                {flow?.nodes.map(node => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  return (
                    <div
                      key={node.id}
                      className="absolute rounded-sm"
                      style={{
                        left: pos.x * sx,
                        top: pos.y * sy,
                        width: nodeW,
                        height: nodeH,
                        backgroundColor: node.type === 'trigger' ? 'rgba(0,88,195,0.55)' : 'rgba(100,116,139,0.4)',
                      }}
                    />
                  );
                })}
                {/* Viewport indicator */}
                {canvasScroll.width > 0 && (
                  <div
                    className="absolute border-2 border-primary/70 rounded-sm pointer-events-none"
                    style={{ left: vpLeft, top: vpTop, width: Math.max(8, vpW), height: Math.max(6, vpH), backgroundColor: 'rgba(0,88,195,0.08)' }}
                  />
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Right Properties Panel */}
      <aside className={cn(
        "fixed inset-y-0 right-0 lg:relative w-full sm:w-80 h-full bg-white border-l border-outline-variant/10 flex flex-col shadow-2xl z-50 transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline font-extrabold text-on-surface text-lg">
              {selectedNodeId ? 'Edit Node' : 'Flow Settings'}
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">{flow?.name || 'Flow Settings'}</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-5">
          {(() => {
            const selectedNode = flow?.nodes.find(n => n.id === selectedNodeId);
            if (!selectedNode) {
              return (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
                    <Zap className="w-7 h-7 text-on-surface-variant opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">No node selected</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">Click any node on the canvas to edit it, or use the <strong>+</strong> button to add a new node.</p>
                  </div>
                  <button
                    onClick={() => openAddNode(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Node
                  </button>
                </div>
              );
            }
            return (
              <>
                {/* Node header with delete */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full",
                    selectedNode.type === 'trigger' ? "bg-primary/10 text-primary" : "bg-surface-container-highest text-primary"
                  )}>
                    {selectedNode.type}
                  </span>
                  {selectedNode.type !== 'trigger' && (
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <label className="block">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Node Title</span>
                  <input
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => updateNodeField(selectedNode.id, 'title', e.target.value)}
                  />
                </label>

                {/* Description */}
                <label className="block">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Description</span>
                  <input
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    type="text"
                    value={selectedNode.description}
                    onChange={(e) => updateNodeField(selectedNode.id, 'description', e.target.value)}
                  />
                </label>

                {/* Trigger-specific fields */}
                {selectedNode.type === 'trigger' && (
                  <>
                    <label className="block">
                      <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Target Keyword</span>
                      <input
                        className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                        type="text"
                        value={selectedNode.config?.keyword || ''}
                        onChange={(e) => updateNodeConfig(selectedNode.id, 'keyword', e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Match Strategy</span>
                      <select
                        className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all shadow-sm appearance-none"
                        value={selectedNode.config?.strategy || 'Exact Match'}
                        onChange={(e) => updateNodeConfig(selectedNode.id, 'strategy', e.target.value)}
                      >
                        <option>Exact Match</option>
                        <option>Contains Keyword</option>
                        <option>Starts With</option>
                      </select>
                    </label>

                    {/* ── Premium: Select Post / Reel / Story ── */}
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Attach to Post / Reel / Story</span>
                        <span className="flex items-center gap-0.5 bg-amber-400/20 text-amber-600 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                        </span>
                      </div>

                      {selectedNode.config?.selectedPost ? (
                        /* Selected post preview */
                        <div className="relative rounded-xl overflow-hidden border-2 border-primary/40 shadow-sm">
                          <img
                            src={selectedNode.config.selectedPost.thumbnail}
                            alt="Selected post"
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          {/* collab badge */}
                          {selectedNode.config.selectedPost.collabWith && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                              <img src={selectedNode.config.selectedPost.collabAvatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                              Collab {selectedNode.config.selectedPost.collabWith}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                            {selectedNode.config.selectedPost.type === 'reel' || selectedNode.config.selectedPost.type === 'collab_reel'
                              ? <Film className="w-2.5 h-2.5" />
                              : selectedNode.config.selectedPost.type === 'story' || selectedNode.config.selectedPost.type === 'collab_story'
                              ? <PlayCircle className="w-2.5 h-2.5" />
                              : <Image className="w-2.5 h-2.5" />}
                            {POST_TYPE_LABEL[selectedNode.config.selectedPost.type as PostMedia['type']]}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-[10px] font-semibold line-clamp-1">{selectedNode.config.selectedPost.caption}</p>
                            <p className="text-white/70 text-[9px] mt-0.5">{selectedNode.config.selectedPost.likes.toLocaleString()} likes · {selectedNode.config.selectedPost.comments.toLocaleString()} comments</p>
                          </div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-8 h-8 text-primary drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant mb-2">
                          Target a specific post or reel — including collab posts — so this automation only triggers on comments from that content.
                        </p>
                      )}

                      <button
                        onClick={() => setIsPostPickerOpen(true)}
                        className="mt-2 w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 fill-current" />
                          {selectedNode.config?.selectedPost ? 'Change Selection' : 'Select Post / Reel / Story'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {selectedNode.config?.selectedPost && (
                        <button
                          onClick={() => updateNodeConfig(selectedNode.id, 'selectedPost', null)}
                          className="mt-1.5 w-full text-[10px] text-on-surface-variant hover:text-error transition-colors text-center"
                        >
                          Remove selection (apply to all posts)
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Action-specific fields */}
                {selectedNode.type === 'action' && (() => {
                  const menu = selectedNode.config?.menu || 'Direct Message';
                  const isDM = menu === 'Direct Message' || menu === 'Interactive Poll' || menu === 'Interactive Menu' || menu === 'Condition';
                  const isPoll = menu === 'Interactive Poll';
                  const isCondition = menu === 'Condition';

                  if (!isDM) {
                    // Wait / Email: keep a simple select + text field
                    return (
                      <>
                        <label className="block">
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Action Type</span>
                          <select
                            className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all shadow-sm appearance-none"
                            value={menu}
                            onChange={(e) => updateNodeConfig(selectedNode.id, 'menu', e.target.value)}
                          >
                            <option>Wait</option>
                            <option>Email</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Value</span>
                          <textarea
                            className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm min-h-[80px]"
                            value={selectedNode.config?.text || ''}
                            onChange={(e) => updateNodeConfig(selectedNode.id, 'text', e.target.value)}
                            placeholder={menu === 'Wait' ? 'e.g. 5 minutes' : 'Enter email content...'}
                          />
                        </label>
                      </>
                    );
                  }

                  return (
                    <>
                      <label className="block">
                        <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mb-2 block">Message</span>
                        <textarea
                          className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm min-h-[100px]"
                          value={selectedNode.config?.text || ''}
                          onChange={(e) => updateNodeConfig(selectedNode.id, 'text', e.target.value)}
                          placeholder="Enter the message content..."
                        />
                      </label>

                      {/* Poll toggle */}
                      <div
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-colors ${isPoll ? 'bg-primary/8 border-primary/30' : 'bg-surface-container border-outline-variant/15 hover:border-primary/20'}`}
                        onClick={() => updateNodeConfig(selectedNode.id, 'menu', isPoll ? 'Direct Message' : 'Interactive Poll')}
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className={`w-4 h-4 ${isPoll ? 'text-primary fill-current' : 'text-on-surface-variant'}`} />
                          <div>
                            <p className={`text-xs font-bold ${isPoll ? 'text-primary' : 'text-on-surface'}`}>Interactive Poll</p>
                            <p className="text-[10px] text-on-surface-variant">Add yes/no or multi-choice buttons</p>
                          </div>
                        </div>
                        <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${isPoll ? 'bg-primary' : 'bg-outline-variant/30'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPoll ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </div>

                      {/* Condition toggle — premium only */}
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-amber-300/40 bg-amber-50/60 cursor-not-allowed opacity-80"
                        onClick={() => toast('If-Else Condition is a Premium feature. Upgrade to unlock.', { icon: '👑' })}
                      >
                        <div className="flex items-center gap-2.5">
                          <GitBranch className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-on-surface">If-Else Condition</p>
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400/20 rounded-full">
                                <Crown className="w-2.5 h-2.5 text-amber-600 fill-current" />
                                <span className="text-[8px] font-black text-amber-700 uppercase tracking-wider">Premium</span>
                              </span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant">Branch the flow based on a condition</p>
                          </div>
                        </div>
                        <div className="w-9 h-5 rounded-full bg-outline-variant/30 relative flex-shrink-0">
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="pt-2 border-t border-outline-variant/10 space-y-2">
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-widest block mb-1">Connections</span>

                  {/* Outgoing edges */}
                  {(flow?.edges || []).filter(e => e.source === selectedNode.id).length === 0 && (
                    <p className="text-[10px] text-on-surface-variant">No outgoing connections yet.</p>
                  )}
                  {(flow?.edges || []).filter(e => e.source === selectedNode.id).map(edge => {
                    const targetNode = flow?.nodes.find(n => n.id === edge.target);
                    return (
                      <div key={edge.id} className="flex items-center gap-2 py-1.5 px-3 bg-surface-container-low rounded-xl">
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs text-on-surface flex-1 truncate">{targetNode?.title || edge.target}</span>
                        <button
                          onClick={() => handleDeleteEdge(edge.id)}
                          className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                          title="Remove connection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => {
                      setConnectingFrom(selectedNode.id);
                      toast('Click another node to connect');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-emerald-400/50 text-emerald-700 bg-emerald-50/50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Connect to Node
                  </button>
                  <button
                    onClick={() => openAddNode(selectedNode.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-primary/40 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Node After This
                  </button>
                </div>
              </>
            );
          })()}
        </div>

        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="py-3 px-4 border border-outline-variant/30 text-on-surface font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-surface-container transition-all"
            >Deselect</button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="py-3 px-4 bg-surface-container-highest text-primary font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
            </button>
          </div>
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="w-full py-3 px-4 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Publish as Campaign
          </button>
        </div>
      </aside>

      {/* Floating Action Buttons */}
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col gap-3 transition-all duration-300",
        isSidebarOpen ? "lg:right-88" : "right-6"
      )}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 h-12 md:w-14 md:h-14 bg-white text-on-surface shadow-2xl rounded-full border border-outline-variant/10 flex items-center justify-center hover:scale-110 transition-transform lg:hidden"
        >
          <SettingsIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button 
          onClick={handleTestFlow}
          disabled={isSaving}
          className="w-12 h-12 md:w-14 md:h-14 bg-white text-on-surface shadow-2xl rounded-full border border-outline-variant/10 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          title="Test Flow"
        >
          {isSaving ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current text-emerald-500" />}
        </button>
        <button
          onClick={() => openAddNode(null)}
          className="w-12 h-12 md:w-14 md:h-14 primary-gradient text-white shadow-2xl rounded-full flex items-center justify-center hover:rotate-90 transition-all"
          title="Add Node"
        >
          <Plus className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Post / Reel Picker Modal — Premium */}
      {isPostPickerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          onClick={() => setIsPostPickerOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-amber-400/15 text-amber-600 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3 fill-current" /> Premium
                  </span>
                  <h3 className="font-headline font-extrabold text-on-surface text-base">Select Post or Reel</h3>
                </div>
                <button onClick={() => setIsPostPickerOpen(false)} className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">Automation will only trigger on comments from the selected content — including collab posts.</p>

              {/* Type filter pills */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {(['all', 'post', 'reel', 'story', 'collab_post', 'collab_reel', 'collab_story'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPostFilterType(f)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1",
                      postFilterType === f
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {(f === 'collab_post' || f === 'collab_reel' || f === 'collab_story') && <Users className="w-2.5 h-2.5" />}
                    {f === 'all' ? 'All' : POST_TYPE_LABEL[f as PostMedia['type']]}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3">
              {MOCK_POSTS
                .filter(p => postFilterType === 'all' || p.type === postFilterType)
                .map(post => {
                  const selectedNodeNow = flow?.nodes.find(n => n.id === selectedNodeId);
                  const isSelected = selectedNodeNow?.config?.selectedPost?.id === post.id;
                  return (
                    <button
                      key={post.id}
                      onClick={() => {
                        if (selectedNodeId) {
                          updateNodeConfig(selectedNodeId, 'selectedPost', post);
                          setIsPostPickerOpen(false);
                          toast.success(`Automation attached to "${post.type === 'reel' || post.type === 'collab_reel' ? 'Reel' : 'Post'}"`);
                        }
                      }}
                      className={cn(
                        "relative rounded-2xl overflow-hidden text-left group border-2 transition-all",
                        isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/30"
                      )}
                    >
                      <img src={post.thumbnail} alt="" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                      {/* Type badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {post.type === 'reel' || post.type === 'collab_reel'
                          ? <Film className="w-2.5 h-2.5" />
                          : post.type === 'story' || post.type === 'collab_story'
                          ? <PlayCircle className="w-2.5 h-2.5" />
                          : <Image className="w-2.5 h-2.5" />}
                        {post.type === 'collab_reel' || post.type === 'collab_post' || post.type === 'collab_story' ? 'Collab' : POST_TYPE_LABEL[post.type]}
                      </div>

                      {/* Collab avatar */}
                      {post.collabWith && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          <img src={post.collabAvatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                          <Users className="w-2.5 h-2.5" />
                        </div>
                      )}

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full p-1">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}

                      {/* Caption & stats */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-white text-[10px] font-semibold line-clamp-2 leading-snug">{post.caption}</p>
                        <div className="flex items-center gap-2 mt-1 text-white/70 text-[9px]">
                          <span>❤️ {post.likes.toLocaleString()}</span>
                          <span>💬 {post.comments.toLocaleString()}</span>
                          <span className="ml-auto">{post.date}</span>
                        </div>
                        {post.collabWith && (
                          <div className="flex items-center gap-1 mt-1">
                            <img src={post.collabAvatar} alt="" className="w-4 h-4 rounded-full border border-white/40" />
                            <span className="text-white/80 text-[9px] font-semibold">{post.collabWith}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="p-4 border-t border-outline-variant/10 flex-shrink-0">
              <button
                onClick={() => setIsPostPickerOpen(false)}
                className="w-full py-2.5 px-4 bg-surface-container-low text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {isAddNodeOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
          onClick={() => setIsAddNodeOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline font-extrabold text-on-surface text-lg">Add Action Node</h3>
              <button
                onClick={() => setIsAddNodeOpen(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant mb-5">Choose the type of action to add to your flow.</p>
            <div className="space-y-2">
              {/* Direct Message */}
              <button
                onClick={() => handleAddNode({ title: 'Send Direct Message', description: 'Send a plain text DM to the user.', Icon: MessageSquare, config: { menu: 'Direct Message', text: '' } })}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container border border-outline-variant/15 text-left transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Direct Message</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Send a DM — add poll or condition from the node settings.</p>
                </div>
              </button>
              {/* Other templates */}
              {NODE_TEMPLATES.map((t) => (
                <button
                  key={t.title}
                  onClick={() => handleAddNode(t)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container border border-outline-variant/15 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                    <t.Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
