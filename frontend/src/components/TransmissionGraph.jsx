import { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function TransmissionGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/cases')
      .then(r => r.json())
      .then(cases => {
        const nodes = cases.map(c => ({
          id: c.id,
          name: c.label,
          val: 10,
          color: c.status === 'CONFIRMED' ? '#ef4444' : '#f59e0b',
          notes: c.notes,
          generation: c.generation
        }));
        const links = cases
          .filter(c => c.parent_id)
          .map(c => ({
            source: c.parent_id,
            target: c.id
          }));
        
        setData({ nodes, links });
        setLoading(false);
      })
      .catch(err => {
        console.error("Graph load failed:", err);
        setLoading(false);
      });

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    setTimeout(updateSize, 100);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (loading) {
    return <div className="graph-placeholder">Loading Analysis Graph...</div>;
  }

  if (data.nodes.length === 0) {
     return (
       <div className="intel-placeholder">
         <h3>No Active Cluster Defined</h3>
         <p>Enter patient data in admin console to start transmission tracking.</p>
       </div>
     );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#f9fafb', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '4px', fontSize: '10px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>MAP LEGEND</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div> Confirmed Case
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div> Suspected / Monitored
        </div>
      </div>
      
      <ForceGraph2D
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="notes"
        nodeRelSize={6}
        linkColor={() => '#94a3b8'}
        linkWidth={2}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px 'Inter', sans-serif`;
            
            // Draw outer ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(label, node.x, node.y + 12);
            
            // Small text for generation
            ctx.font = `${8/globalScale}px sans-serif`;
            ctx.fillStyle = '#64748b';
            ctx.fillText(node.generation, node.x, node.y + 20);
        }}
      />
    </div>
  );
}
