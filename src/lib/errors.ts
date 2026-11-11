/** Turns any thrown value into a message suitable to show the user. */
export function friendlyError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
}
