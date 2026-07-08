import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getEmployee, updateEmployee } from './api/employees';
import type { EmployeeInput } from './api/types';

const emptyForm: EmployeeInput = {
  fullName: '',
  doors: [],
};

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [doorInput, setDoorInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Agora busca apenas os dados do funcionário. Sem buscar /faces (resolve o 404!)
    getEmployee(id)
      .then((e) => {
        setForm({
          fullName: e.fullName,
          doors: e.doors || [],
        });
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  function update<K extends keyof EmployeeInput>(key: K, value: EmployeeInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAddDoor() {
    const door = doorInput.trim();
    if (door && !form.doors.includes(door)) {
      update('doors', [...form.doors, door]);
    }
    setDoorInput('');
  }

  function handleRemoveDoor(doorToRemove: string) {
    update('doors', form.doors.filter((d) => d !== doorToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError(null);
    try {
      await updateEmployee(id, form);
      navigate('/funcionarios');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar funcionário. Verifique o CORS na AWS.');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-sm text-text-faint">Carregando dados do funcionário…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/funcionarios" className="text-xs text-text-muted hover:text-primary">
          ← Voltar para funcionários
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight mt-2">
          Gerenciar Acessos
        </h1>
        <p className="text-sm text-text-muted mt-1">Edite as permissões e portas deste funcionário.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft text-danger text-sm px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5">
          <Field label="Nome completo" required>
            <input
              required
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="input"
              placeholder="Ex: João Silva"
            />
          </Field>

          <Field label="Portas permitidas">
            <div className="flex gap-2">
              <input
                type="text"
                value={doorInput}
                onChange={(e) => setDoorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoor();
                  }
                }}
                className="input"
                placeholder="Ex: Recepção, TI..."
              />
              <button
                type="button"
                onClick={handleAddDoor}
                className="px-4 py-2 bg-canvas border border-line rounded-lg text-sm font-medium hover:border-primary transition-colors"
              >
                Adicionar
              </button>
            </div>
            
            {form.doors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.doors.map((door) => (
                  <span key={door} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary-strong text-xs font-medium border border-primary/20">
                    {door}
                    <button
                      type="button"
                      onClick={() => handleRemoveDoor(door)}
                      className="text-primary-strong/60 hover:text-danger transition-colors font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {form.doors.length === 0 && (
              <p className="text-xs text-text-faint mt-2">Nenhuma porta vinculada. O funcionário não terá acesso.</p>
            )}
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-line-soft">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-strong transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar permissões'}
          </button>
          <Link to="/funcionarios" className="text-sm text-text-muted hover:text-text">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-text-muted">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}