/**
 * This component is for development purposes only, because it
 * depends on teleglitch game files which are not publicly available.
 */
export default function TeleglitchModule() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return (
    <img src="api/teleglitch/gfx?set1.png" />
  );
}
