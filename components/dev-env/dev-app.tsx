const DevApp: React.FC<Props> = ({ panelKey }) => {
  /**
   * TODO bootstrap script on mount/unmount
   * via thunk to redux state 'dev-env'.
   */

  return (
    <div
      id={`app-render-root-${panelKey}`}
      style={{ padding: 8, color: 'white' }}
    >
      App ({panelKey})
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevApp;