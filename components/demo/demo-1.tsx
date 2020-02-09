import NavDom from '@components/nav-dom/nav-dom';

const dim = (width: number, height: number) =>
  ({ width, height, background: '#000' });

const containerTest: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  // // width: 500px;
  margin: '20px 0',
};

const Demo1: React.FC = () => {
  return (
    <NavDom uid='demo'>
      <div style={containerTest}>
        <div style={dim(30,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
      </div>
      <div style={containerTest}>
        <div style={dim(30,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
      </div>
      <div style={containerTest}>
        <div style={dim(70,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
        <div style={dim(30, 60)}/>
      </div>
      <div style={containerTest}>
        <div style={dim(30,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
        <div style={dim(30, 60)}/>
      </div>
      <div style={containerTest}>
        <div style={dim(30,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
      </div>
      <div style={containerTest}>
        <div style={dim(30,30)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 60)}/>
        <div style={dim(30, 30)}/>
      </div>
    </NavDom>

  );
};

export default Demo1;
