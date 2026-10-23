import { createLessonSession } from './session.js';

// App-owned input contract. A native adapter supplies verified interaction events.
// Each rendered frame carries a revision: queued callbacks from older frames cannot
// skip a stage or repeat a measurement after the display has changed.
export function createLessonControls({ random = Math.random, render = () => {}, reducedMotion = true } = {}) {
  if (typeof render !== 'function') throw new TypeError('Expected a renderer function');
  let revision = 0, inputAvailable = true, busy = false;
  function decorate(model) {
    const controls = model.controls.map(item => ({ ...item, enabled: item.enabled && inputAvailable,
      disabledReason: inputAvailable ? item.disabledReason : 'Input is unavailable. Restore input to continue.' }));
    return { ...model, revision, inputAvailable, controls,
      focusOrder: controls.filter(item => item.enabled).map(item => item.id) };
  }
  const session = createLessonSession({ random, reducedMotion, render: model => render(decorate(model)) });
  const denied = (code, message) => ({ ok: false, committed: false, revision,
    state: session.getState(), error: { code, message } });
  function transact(operation) {
    if (busy) return denied('CONTROLS_BUSY', 'Wait for the current display update.');
    if (revision === Number.MAX_SAFE_INTEGER) return denied('CONTROL_LIMIT', 'Start a new control session.');
    busy = true;
    revision++; // Consume the old callback before calling a renderer or sampler.
    try { return { ...operation(), revision }; }
    finally { busy = false; }
  }
  return {
    getState: session.getState,
    getPresentation: () => decorate(session.getPresentation()),
    activate(id, renderedRevision) {
      if (busy) return denied('CONTROLS_BUSY', 'Wait for the current display update.');
      if (typeof id !== 'string' || !id.length || !Number.isSafeInteger(renderedRevision) || renderedRevision < 0) {
        return denied('INVALID_CONTROL', 'Use a control and revision from the displayed lesson.');
      }
      if (renderedRevision !== revision) return denied('STALE_CONTROL', 'Use the controls on the current display.');
      if (!inputAvailable) return denied('INPUT_UNAVAILABLE', 'Restore input to continue.');
      const item = session.getPresentation().controls.find(control => control.id === id);
      if (!item || !item.enabled) return denied('CONTROL_UNAVAILABLE', 'This control is unavailable in the current lesson.');
      return transact(() => session.dispatch(item.action));
    },
    refresh: () => transact(() => session.refresh()),
    setInputAvailable(value) {
      if (typeof value !== 'boolean') return denied('INVALID_INPUT_STATE', 'Input availability must be boolean.');
      return transact(() => { inputAvailable = value; return session.refresh(); });
    }
  };
}
