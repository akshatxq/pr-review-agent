import { useState } from 'react';

const agentMeta = {
  code_quality: { label: 'Code Quality', emoji: '🔍' },
  security:     { label: 'Security',      emoji: '🔒' },
  dependency:   { label: 'Dependencies',  emoji: '📦' },
  summarizer:   { label: 'Summarizer',    emoji: '📝' },
};

const AgentLogPanel = ({ run }) => {
  const [open, setOpen] = useState(false);
  const meta = agentMeta[run.agent_name] ?? { label: run.agent_name, emoji: '🤖' };

  return (
    <div style={{
      border: '1px solid #1e1e1e',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: '#141414',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{meta.emoji}</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
            {meta.label}
          </span>
          <span style={{
            fontSize: '11px',
            color: run.status === 'success' ? '#4ade80' : '#f87171',
            backgroundColor: run.status === 'success' ? '#0d2b1a' : '#2b0d0d',
            padding: '2px 8px',
            borderRadius: '999px',
          }}>
            {run.status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#555' }}>
          {run.execution_time_ms && (
            <span>{run.execution_time_ms}ms</span>
          )}
          {run.output_tokens && (
            <span>{run.output_tokens} tokens</span>
          )}
          <span style={{ fontSize: '16px' }}>{open ? '−' : '+'}</span>
        </div>
      </div>

      {open && (
        <div style={{
          padding: '16px',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #1e1e1e',
          fontSize: '13px',
          color: '#aaa',
          lineHeight: '1.7',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}>
          {run.output ?? run.error_message ?? 'No output'}
        </div>
      )}
    </div>
  );
};

export default AgentLogPanel;