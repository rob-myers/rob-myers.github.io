const WindowPanel: React.FC<Props> = ({ panelKey }) => {
  return (
    <div style={{ color: '#fff', padding: '8px 0 0 8px' }}>
      Hello, world ({panelKey})
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default WindowPanel;
