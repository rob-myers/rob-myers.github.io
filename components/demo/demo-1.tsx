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
    <div style={{ display: 'flex' }}>
      <NavDom 
        uid='demo0' width={600} height={200}
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
      </NavDom>
    
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
          <svg width={250} height={100}>
            <polygon fill="#555" points={`${[0,0, 200,0, 250,50, 200,100, 0,100, 50,50]}`} />
          </svg>
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
    </div>
  );
};

export default Demo1;
