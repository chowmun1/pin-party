import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave without saving?';

/**
 * Warns before losing unsaved work: on tab close/refresh (browser prompt) and
 * on in-app navigation (confirm dialog). Returns a function to call right
 * before an intentional navigation (e.g. after saving) to skip the warning.
 */
export function useUnsavedChangesWarning(dirty: boolean, message = DEFAULT_MESSAGE): () => void {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

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

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(message)) blocker.proceed();
    else blocker.reset();
  }, [blocker, message]);

  return () => {
    dirtyRef.current = false;
  };
}
