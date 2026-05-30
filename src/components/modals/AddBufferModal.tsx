import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Modal } from '../ui/Modal';

const PRESETS = [5, 10, 15, 20];

type Props = {
  onConfirm: (minutes: number) => void;
  onClose: () => void;
};

export function AddBufferModal({ onConfirm, onClose }: Props) {
  const { preferences } = useApp();
  const [selected, setSelected] = useState(preferences.defaultBufferMinutes);
  const [custom, setCustom] = useState('');

  const minutes = custom ? Math.max(1, Number(custom)) : selected;

  return (
    <Modal
      title="Add buffer time"
      subtitle="Insert flex time right after the current block"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-subtle">
            Cancel
          </button>
          <button onClick={() => onConfirm(minutes)} className="btn-primary">
            Add {minutes}m buffer
          </button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setSelected(m);
              setCustom('');
            }}
            className={`rounded-xl py-3 text-sm font-semibold transition ${
              !custom && selected === m
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {m}m
          </button>
        ))}
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Custom</label>
        <input
          type="number"
          min={1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Minutes"
          className="input"
        />
      </div>
    </Modal>
  );
}
