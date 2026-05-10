import { useState } from 'react';

export default function AdminPortal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    status: 'CONFIRMED',
    generation: 'G0',
    parent_id: '',
    notes: ''
  });
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving...');
    try {
      const resp = await fetch('http://localhost:8000/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id.trim() || null
        })
      });
      if (resp.ok) {
        setStatusMsg('Saved successfully!');
        setTimeout(() => {
            setStatusMsg('');
            setFormData({id:'', label:'', status:'CONFIRMED', generation:'G0', parent_id:'', notes:''});
            onSave && onSave();
        }, 1000);
      } else {
        setStatusMsg('Failed to save.');
      }
    } catch (err) {
      setStatusMsg('Network Error.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{
        width: '400px', padding: '24px', background: '#fff', borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'none',
          border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b'
        }}>&times;</button>
        
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
          INTEL INPUT OVERRIDE
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>IDENTIFIER (E.g. CASE-001)</label>
            <input 
              required type="text" value={formData.id} 
              onChange={e => setFormData({...formData, id: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>DISPLAY LABEL</label>
            <input 
              required type="text" value={formData.label} 
              onChange={e => setFormData({...formData, label: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>STATUS</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SUSPECTED">SUSPECTED</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>GEN</label>
              <input 
                type="text" value={formData.generation} 
                onChange={e => setFormData({...formData, generation: e.target.value})}
                placeholder="G0, G1..."
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>PARENT CASE ID (FOR GRAPH LINK)</label>
            <input 
              type="text" value={formData.parent_id} 
              onChange={e => setFormData({...formData, parent_id: e.target.value})}
              placeholder="e.g. P-INDEX"
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>INTEL NOTES</label>
            <textarea 
              rows="2" value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px', resize: 'none' }}
            />
          </div>

          <button type="submit" style={{
             background: '#0f172a', color: '#fff', border: 'none',
             padding: '10px', borderRadius: '4px', fontWeight: '600',
             cursor: 'pointer', marginTop: '8px'
          }}>
            COMMIT TO INTELLIGENCE REPO
          </button>
          
          {statusMsg && <div style={{ fontSize: '12px', textAlign: 'center', color: '#059669' }}>{statusMsg}</div>}
        </form>
      </div>
    </div>
  );
}
