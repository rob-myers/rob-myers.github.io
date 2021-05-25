import { useEffect, useRef } from "react";
import { html, render } from 'htm/preact/standalone.module';

export default function PreactTest() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    render(html`<a href="/">Hello!</a>`, root.current!);
  }, []);

  return (
    <div ref={root}>
      Preact Test
    </div>
  );
}