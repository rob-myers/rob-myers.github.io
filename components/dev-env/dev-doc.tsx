const DevDoc: React.FC<Props>  = () => {
  return (
    <div>
      Doc panel
    </div>
  );
};

export default DevDoc;

interface Props {
  panelKey: string;
  filename: string;
}