import React from 'react';

/** @param {NPC.MessagesProps} props */
export default function Messages(props) {

  const [state] = React.useState(() => {
    const output = {
      root: /** @type {SVGGElement} */ ({}),
      /** @type {React.RefCallback<SVGGElement>} */
      rootRef(el) {
        el && (state.root = el);
      },
    };
    return output;
  });

  React.useEffect(() => {
    props.onLoad?.({
      create: (key, text, position) => {
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        fo.setAttribute('width', '100px');
        fo.setAttribute('height', '100px');
        fo.appendChild(document.createElement('div')).textContent = 'Hello, world!';
        state.root.appendChild(fo);
      },
      remove: (key) => {
        const results = state.root.querySelectorAll(`.${key}`);
        results.forEach(node => node.remove());
        return results.length > 0;
      },
    });
  }, []);


  return (
    <g className="messages" ref={state.rootRef} />
  );
}

