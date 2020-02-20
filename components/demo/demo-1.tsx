import NavDom from '@components/nav-dom/nav-dom';
import css from './demo.scss';
import { Cross, Line, Room, TurnNw, TurnNe, Blank, TurnSw } from './tiles';
import { Row } from './box';


const Demo1: React.FC = () => {

  return (
    <div className={css.demo1Root}>
      <NavDom 
        uid='demo'
        width={600}
        height={800}
        contentClass={css.demo1Content}
        navOutset={8}
      >
        <div style={{ margin: 'auto' }}>
          <Row>
            <Cross n w />
            <Line h />
            <TurnSw />
          </Row>
          <Row>
            <Line v />
            <Room e />
            <Cross />
            <Room w />
          </Row>
          <Row>
            <Cross w />
            <Line h />
            <TurnNw />
          </Row>
          <Row>
            <TurnNe />
            <Line h />
            <Room w s E />
            <Room W />
          </Row>
          <Row>
            <Blank/>
            <Blank/>
            <Room N/>
          </Row>
        </div>
      </NavDom>
    </div>
  );
};

export default Demo1;
