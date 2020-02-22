import NavDom from '@components/nav-dom/nav-dom';
import { Cross, Line, Room, TurnNw, TurnNe, Blank, TurnSw, Offset } from './tiles';
import { Row } from './box';
import css from './demo.scss';
import NavSpawn from '@components/nav-dom/nav-spawn';


const Demo1: React.FC = () => {

  return (
    <div className={css.demo1Root} >
      <NavDom 
        uid='demo'
        contentClass={css.demo1Content}
        navOutset={8}
      >
        <Row>
          <Cross n w />
          <Line h />
          <TurnSw />
        </Row>
        <Row>
          <Line v />
          <Room e>
            <Offset left={20} top={20}>
              <NavSpawn uid={'first'} />
            </Offset>
            <Offset right={20} bottom={20}>
              <NavSpawn uid={'second'} />
            </Offset>
          </Room>
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
          <Room N W/>
        </Row>
      </NavDom>
    </div>
  );
};

export default Demo1;
