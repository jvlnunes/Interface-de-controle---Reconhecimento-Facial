import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee } from './api/employees';
import { listFaces, uploadFace, deleteFace } from './api/faces';
import type { EmployeeInput, FaceRecord } from './api/types';
import FaceCapture from './components/FaceCapture';
import ScanFrame from './components/ScanFrame';

const emptyForm: EmployeeInput = {
  fullName: '',
  doors: [],
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'novo';
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [doorInput, setDoorInput] = useState('');
  const [faces, setFaces] = useState<FaceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    getEmployee(id)
      .then((e) => {
        setForm({
          fullName: e.fullName,
          doors: e.doors || [],
        });
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
    listFaces(id).then(setFaces).catch(() => {});
  }, [id, isEdit]);

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
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await updateEmployee(id, form);
      } else {
        const created = await createEmployee(form);
        navigate(`/funcionarios/${created.id}`, { replace: true });
        setSaving(false);
        return;
      }
      navigate('/funcionarios');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar funcionário');
    } finally {
      setSaving(false);
    }
  }

  async function handleFaceCapture(blob: Blob) {
    if (!id || !isEdit) {
      setError('Salve o cadastro antes de adicionar fotos.');
      return;
    }
    try {
      const record = await uploadFace(id, blob);
      setFaces((f) => [record, ...f]);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar foto');
    }
  }

  async function handleFaceDelete(faceId: string) {
    if (!id) return;
    try {
      await deleteFace(id, faceId);
      setFaces((f) => f.filter((face) => face.id !== faceId));
    } catch (err: any) {
      setError(err.message || 'Erro ao remover foto');
    }
  }

  if (!loaded) return <p className="text-sm text-text-faint">Carregando…</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link to="/funcionarios" className="text-xs text-text-muted hover:text-primary">
          ← Voltar para funcionários
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight mt-2">
          {isEdit ? 'Editar funcionário' : 'Novo funcionário'}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft text-danger text-sm px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-strong transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar funcionário'}
            </button>
            <Link to="/funcionarios" className="text-sm text-text-muted hover:text-text">
              Cancelar
            </Link>
          </div>
        </form>

        <div className="rounded-xl border border-line bg-surface p-6 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-sm tracking-wide text-text-muted uppercase">
              Reconhecimento facial
            </h2>
            <p className="text-xs text-text-faint mt-1">
              {isEdit ? 'Capture ou envie fotos do rosto para o reconhecimento.' : 'Salve o cadastro para liberar esta etapa.'}
            </p>
          </div>

          <FaceCapture onCapture={handleFaceCapture} disabled={!isEdit} />

          {faces.length > 0 && (
            <div className="pt-3 border-t border-line-soft space-y-2">
              <p className="text-xs text-text-muted font-medium">{faces.length} foto{faces.length === 1 ? '' : 's'} cadastrada{faces.length === 1 ? '' : 's'}</p>
              <div className="grid grid-cols-3 gap-2">
                {faces.map((face) => (
                  <div key={face.id} className="relative group">
                    <ScanFrame size="sm">
                      <img src={face.thumbnailUrl || face.imageUrl} alt="" className="w-full h-full object-cover" />
                    </ScanFrame>
                    <button
                      onClick={() => handleFaceDelete(face.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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