'use client';
import { useRef, useState, useReducer, useCallback } from 'react';

// One reversible action. `undo`/`redo` perform the Supabase write + state update
// and return true on success (false leaves the op on its original stack).
export type HistoryOp = {
  label: string;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
};

const MAX = 50;

export function useHistory() {
  const undoStack = useRef<HistoryOp[]>([]);
  const redoStack = useRef<HistoryOp[]>([]);
  const [, force]  = useReducer((x: number) => x + 1, 0);
  const [busy, setBusy] = useState(false);

  // Record an action whose forward effect has ALREADY run.
  const record = useCallback((op: HistoryOp) => {
    undoStack.current.push(op);
    if (undoStack.current.length > MAX) undoStack.current.shift();
    redoStack.current = [];
    force();
  }, []);

  const undo = useCallback(async (): Promise<HistoryOp | null> => {
    const op = undoStack.current.pop();
    if (!op) return null;
    setBusy(true);
    let ok = false;
    try { ok = await op.undo(); } finally { setBusy(false); }
    if (ok) redoStack.current.push(op);
    else undoStack.current.push(op);
    force();
    return ok ? op : null;
  }, []);

  const redo = useCallback(async (): Promise<HistoryOp | null> => {
    const op = redoStack.current.pop();
    if (!op) return null;
    setBusy(true);
    let ok = false;
    try { ok = await op.redo(); } finally { setBusy(false); }
    if (ok) undoStack.current.push(op);
    else redoStack.current.push(op);
    force();
    return ok ? op : null;
  }, []);

  return {
    record,
    undo,
    redo,
    busy,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    nextUndoLabel: undoStack.current[undoStack.current.length - 1]?.label ?? '',
    nextRedoLabel: redoStack.current[redoStack.current.length - 1]?.label ?? '',
  };
}
