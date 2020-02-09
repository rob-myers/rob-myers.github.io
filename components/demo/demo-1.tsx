import NavDom from '@components/nav-dom/nav-dom';

const dim = (width: number, height: number) =>
  ({ width, height, background: '#000' });

const containerTest: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  margin: '40px 0',
};

const Demo1: React.FC = () => {
  return (
    <NavDom 
      uid='demo' width={600} height={800}
      contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
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
        <div style={dim(150, 60)}/>
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
      {/* <div style={containerTest}>
          <div style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div> */}
    </NavDom>

  );
};

export default Demo1;
