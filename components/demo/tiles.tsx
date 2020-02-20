import { Box, Row, Col, dim } from './box';

export const Cross: React.FC<{
  n?: boolean;
  e?: boolean;
  s?: boolean;
  w?: boolean;
}> = ({ n, e, s, w }) =>
  <div>
    <Row width={3 * dim} justifyContent="center">
      <Box e w n={n} />
    </Row>
    <Row>
      <Box n s w={w} />
      <Box ne se sw nw />
      <Box n e={e} s />
    </Row>
    <Row width={3 * dim} justifyContent="center">
      <Box e s={s} w />
    </Row>
  </div>;

export const Line: React.FC<LineProps> = (props) => (
  'h' in props && (
    <Col height={3 * dim} justifyContent='center'>
      <Row>
        <Box n s w={props.w} />
        <Box n s />
        <Box n s e={props.e} />
      </Row>
    </Col>
  ) || 'v' in props && (
    <Row width={3 * dim} justifyContent='center'>
      <div>
        <Box e w n={props.n} />
        <Box e w />
        <Box e w s={props.s} />
      </div>
    </Row>
  ) || null
);

type LineProps = (
  | { h: boolean; e?: boolean; w?: boolean }
  | { v: boolean; n?: boolean; s?: boolean }
);

export const Room: React.FC<{
  n?: boolean; N?: boolean;
  e?: boolean; E?: boolean;
  s?: boolean; S?: boolean;
  w?: boolean; W?: boolean;
}> = ({ n, N, e, E, s, S, w, W }) => (
  <Col height={3 * dim}>
    <Row>
      <Box n={!N} w={!W} />
      {n ? <Box ne nw /> : <Box n={!N} />}
      <Box n={!N} e={!E} />
    </Row>
    <Row width={3 * dim} justifyContent="space-between">
      {w ? <Box nw sw /> : <Box w={!W} /> }
      {e ? <Box ne se /> : <Box e={!E} />}
    </Row>
    <Row>
      <Box s={!S} w={!W} />
      {s ? <Box se sw /> : <Box s={!S} />}
      <Box s={!S} e={!E} />
    </Row>
  </Col>
);

export const Blank: React.FC = () => (
  <Col height={3 * dim}>
    <Row width={3 * dim} />
  </Col>
);

export const TurnNe: React.FC<{
  n?: boolean;
  e?: boolean;
}> = ({ n, e }) => (
  <Col height={3 * dim}>
    <Row width={3 * dim} justifyContent="center">
      <Box e w n={n} />
    </Row>
    <Row width={3 * dim} justifyContent="flex-end">
      <Box w s ne />
      <Box n s e={e} />
    </Row>
  </Col>
);

export const TurnNw: React.FC<{
  n?: boolean;
  w?: boolean;
}> = ({ n, w }) => (
  <Col height={3 * dim}>
    <Row width={3 * dim} justifyContent="center">
      <Box e w n={n} />
    </Row>
    <Row width={3 * dim} >
      <Box n s w={w} />
      <Box e s nw />
    </Row>
  </Col>
);

export const TurnSe: React.FC<{
  s?: boolean;
  e?: boolean;
}> = ({ e, s }) => (
  <Col height={3 * dim} justifyContent="flex-end">
    <Row width={3 * dim} justifyContent="flex-end">
      <Box n w se />
      <Box n s e={e} />
    </Row>
    <Row width={3 * dim} justifyContent="center">
      <Box e w s={s} />
    </Row>
  </Col>
);

export const TurnSw: React.FC<{
  s?: boolean;
  w?: boolean;
}> = ({ s, w }) => (
  <Col height={3 * dim} justifyContent="flex-end">
    <Row width={3 * dim}>
      <Box n s w={w} />
      <Box n e sw />
    </Row>
    <Row width={3 * dim} justifyContent="center">
      <Box e w s={s} />
    </Row>
  </Col>
);
