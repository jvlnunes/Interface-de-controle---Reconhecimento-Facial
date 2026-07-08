import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEmployees, deleteEmployee } from './api/employees';
import type { Employee } from './api/types';
import ScanFrame from './components/ScanFrame';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    listEmployees()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (typeof data === 'string') {
          setEmployees(JSON.parse(data));
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.body)) setEmployees(data.body);
          else if (typeof data.body === 'string') setEmployees(JSON.parse(data.body));
          else if (Array.isArray(data.Items)) setEmployees(data.Items);
          else {
            setEmployees([]); 
          }
        } else {
          setEmployees([]);
        }
      })
      .catch((e) => setError(e.message || 'Falha ao carregar'));
  }

  useEffect(load, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover ${name} do cadastro? Isso também remove os rostos vinculados.`)) return;
    try {
      await deleteEmployee(id);
      load();
    } catch (e: any) {
      alert(e.message || 'Erro ao remover');
    }
  }

  const filtered = Array.isArray(employees)
    ? employees.filter((e) =>
        `${e.fullName} ${e.doors?.join(' ')}`.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie os acessos (portas) de cada funcionário.</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou porta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 rounded-lg border border-line bg-surface text-sm focus:border-primary outline-none"
      />

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft text-danger text-sm px-4 py-3">{error}</div>
      )}

      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="px-5 py-3 font-medium">Funcionário</th>
              <th className="px-5 py-3 font-medium">Portas Liberadas</th>
              <th className="px-5 py-3 font-medium">Fotos Base</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered?.map((e) => (
              <tr key={e.id} className="hover:bg-canvas/60 transition-colors">
                <td className="px-5 py-3">
                  <Link to={`/funcionarios/${e.id}`} className="flex items-center gap-3">
                    <ScanFrame size="sm">
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] font-mono">
                        {e.faceCount > 0 ? '✓' : '?'}
                      </div>
                    </ScanFrame>
                    <div className="font-medium">{e.fullName}</div>
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {e.doors && e.doors.length > 0 ? (
                      e.doors.map((door) => (
                        <span key={door} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-line text-text-muted font-medium">
                          {door}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-danger/70 italic">Sem acesso</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-canvas border border-line">
                    {e.faceCount} foto{e.faceCount === 1 ? '' : 's'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/funcionarios/${e.id}`} className="text-primary hover:underline text-xs font-medium">
                    Editar Acessos
                  </Link>
                  <button
                    onClick={() => handleDelete(e.id, e.fullName)}
                    className="text-danger hover:underline text-xs font-medium"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees && filtered?.length === 0 && (
          <div className="text-center py-12 text-sm text-text-faint">Nenhum cadastro encontrado.</div>
        )}
        {!employees && !error && <div className="text-center py-12 text-sm text-text-faint">Carregando…</div>}
      </div>
    </div>
  );
}