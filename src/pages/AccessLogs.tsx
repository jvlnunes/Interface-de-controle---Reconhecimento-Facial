import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

interface Log {
  id_registro: string;
  timestamp: string;
  porta: string;
  status: string;
  id_funcionario: string;
  score_reconhecimento: string;
  link_foto: string;
}

export default function AccessLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    // Aqui você chamaria um endpoint que lista os logs da sua Lambda de logs
    apiGet<Log[]>('/logs').then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Monitor de Acessos</h1>
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas text-left text-xs uppercase text-text-muted">
              <th className="px-5 py-3">Horário</th>
              <th className="px-5 py-3">Funcionário</th>
              <th className="px-5 py-3">Porta</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {logs.map((log) => (
              <tr key={log.id_registro}>
                <td className="px-5 py-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-5 py-3">{log.id_funcionario}</td>
                <td className="px-5 py-3">{log.porta}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${log.status.includes('Liberado') ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}