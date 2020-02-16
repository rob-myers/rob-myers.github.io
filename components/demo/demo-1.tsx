import NavDom from '@components/nav-dom/nav-dom';
import css from './demo.scss';

const dim = (width: number, height: number) =>
  ({ width, height, background: '#000' });

const Demo1: React.FC = () => {

  return (
    <div className={css.demo1Root}>
      {/* <NavDom 
        uid='demo' width={600} height={200}
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
      </NavDom> */}
    
      <NavDom 
        uid='demo'
        width={'100vw'}
        height={800}
        contentClass={css.demo1Content}
        navOutset={12}
      >
        <div className={css.containerTest}>
          <div style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css.containerTest}>
          <div style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={{
            ...dim(150, 60),
            width: 'calc(10% + 20px)',
            transform: 'rotateZ(45deg) translateX(0px) scale(1.5)'
          }}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css.containerTest}>
          <div style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
          <div style={dim(30, 60)}/>
        </div>
        <div className={css.containerTest}>
          <div style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        {/* <div className={css.containerTest}>
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
