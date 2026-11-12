import { useEffect, useRef, type ReactNode } from 'react';
import { useBlocker } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface LeaveCopy {
  title: string;
  body: string;
  leaveLabel: string;
  stayLabel: string;
}

const DEFAULT_COPY: LeaveCopy = {
  title: 'Leave without saving?',
  body: 'Your changes to this quiz will be lost.',
  leaveLabel: 'Leave without saving',
  stayLabel: 'Keep editing',
};

/**
 * Warns before losing unsaved work: on tab close/refresh (browser prompt) and
 * on in-app navigation (a styled dialog). Render `prompt` somewhere in the
 * page; call `allowLeave()` right before an intentional navigation.
 */
export function useUnsavedChangesWarning(
  dirty: boolean,
  copy: Partial<LeaveCopy> = {},
): { allowLeave: () => void; prompt: ReactNode } {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const c = { ...DEFAULT_COPY, ...copy };

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // required by some browsers to show the prompt
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  const prompt = (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title={c.title}
      confirmLabel={c.leaveLabel}
      cancelLabel={c.stayLabel}
      danger
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      <p>{c.body}</p>
    </ConfirmDialog>
  );

  return {
    allowLeave: () => {
      dirtyRef.current = false;
    },
    prompt,
  };
}
