export const exampleTsx1 = `
import * as React from 'react';

export const App: React.FC = () => {
    return (
        <div>
            // foo
        </div>
    );
};

export default App;
`.trim();

export const exampleTsx2 = `
import * as React from 'react';

const App: React.FC = () => {
  return (
    <div className="App">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
        <circle cx="10" cy="10" r="10" fill="red"/>
      </svg>
    </div>
  );
}

export default App;
`.trim();

export const exampleCss1 = `
.my-class {
  background: red;
}
`.trim();
