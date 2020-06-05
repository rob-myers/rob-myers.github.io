import dynamic from 'next/dynamic';
import shortid from 'shortid';
import { initLayoutConfig } from '@model/layout/example-layout.model';
const GoldenLayoutComponent = dynamic(import('@components/dev-layout/golden-layout'), { ssr: false });
import WindowPanel from '@components/dev-layout/window-panel';


const DevEnvPage: React.FC = () => {
  const [layoutComponentKey, _setLayoutComponentKey] = shortid.generate();

  return (
    <div>
      <GoldenLayoutComponent
        key={layoutComponentKey}
        htmlAttrs={{ style: {
          height: 'calc(100vh - 0px)',
          // height: "100%",
          width: 'calc(100vw - 0px)',
        }}}
        initConfig={initLayoutConfig}
        onComponentCreated={() => {
          //
        }}
        registerComponents={(layoutInstance) => {
          layoutInstance.registerComponent('window-panel', WindowPanel);
        }}
        onDragStart={() => {
          //
        }}
      />
    </div>
  );
};

export default DevEnvPage;
