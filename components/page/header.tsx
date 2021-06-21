import styled from "@emotion/styled";

const Header: React.FC = () => {
  return <>
    <Title>Three.js Behaviours</Title>
  
    <Subtitle>
      Game AI built using <a href="https://threejs.org/">
        three.js
      </a> and <a href="https://preactjs.com/">preact</a>
    </Subtitle>
  </>;
};

const Title = styled.h1<{}>`
  margin-top: 2.5rem;
  margin-bottom: 2rem;
  line-height: 1;
  font-size: 7rem;
  color: #222;

  @media(max-width: 1248px) {
    font-size: 6rem;
  }

  @media(max-width: 800px) {
    font-size: 5rem;
    margin-top: 1rem;
  }
`;

const Subtitle = styled.div<{}>`
  font-weight: normal;
  letter-spacing: 1px;

  padding: 24px 16px;
  background: #eee;
  color: #555;

  a {
    color: #000;
  }

  @media(max-width: 800px) {
    border-radius: 0;
    border-width: 1px 0;
    padding: 18px 4px;
  }
`;

export default Header;
