import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEmployees } from './api/employees';
import type { Employee } from './api/types';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message || 'Falha ao carregar dados'));
  }, []);

  const total = employees?.length ?? 0;
  const enrolled = employees?.filter((e) => e.faceCount > 0).length ?? 0;
  const pending = total - enrolled;
  const active = employees?.filter((e) => e.status === 'active').length ?? 0;

  const cards = [
    { label: 'Funcionários cadastrados', value: total, tone: 'text-text' },
    { label: 'Com rosto enrolado', value: enrolled, tone: 'text-success' },
    { label: 'Pendentes de cadastro facial', value: pending, tone: 'text-warning' },
    { label: 'Ativos', value: active, tone: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Painel</h1>
          <p className="text-sm text-text-muted mt-1">Visão geral do cadastro de funcionários e reconhecimento facial.</p>
        </div>
        <Link
          to="/funcionarios/novo"
          className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-strong transition-colors"
        >
          + Novo funcionário
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft text-danger text-sm px-4 py-3">
          Não foi possível conectar à API ({error}). Verifique <code className="font-mono">VITE_API_BASE_URL</code> no arquivo{' '}
          <code className="font-mono">.env</code>.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-surface p-5">
            <div className={`font-display text-3xl font-semibold ${c.tone}`}>{employees ? c.value : '—'}</div>
            <div className="text-sm text-text-muted mt-1.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-muted uppercase mb-4">
          Cadastros recentes
        </h2>
        {!employees && !error && <p className="text-sm text-text-faint">Carregando…</p>}
        {employees && employees.length === 0 && (
          <p className="text-sm text-text-faint">Nenhum funcionário cadastrado ainda.</p>
        )}
        <div className="divide-y divide-line-soft">
          {employees?.slice(0, 5).map((e) => (
            <Link
              key={e.id}
              to={`/funcionarios/${e.id}`}
              className="flex items-center justify-between py-3 hover:bg-canvas -mx-2 px-2 rounded-lg transition-colors"
            >
              <div>
                <div className="text-sm font-medium">{e.fullName}</div>
                <div className="text-xs text-text-muted font-mono">{e.department} · {e.role}</div>
              </div>
              <StatusPill enrolled={e.faceCount > 0} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ enrolled }: { enrolled: boolean }) {
  return enrolled ? (
    <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-success-soft text-success">rosto ok</span>
  ) : (
    <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-warning-soft text-warning">pendente</span>
  );
}