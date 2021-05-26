import styled from "@emotion/styled";

const Header: React.FC = () => {
  return <>
    <Title>
      Three.js Behaviours
    </Title>
  
    <Subtitle>
      Richer <a href="https://threejs.org/" target="_blank">
        three.js
      </a> demos via behaviour trees
    </Subtitle>
  </>;
};

const Title = styled.h1<{}>`
  margin-bottom: 0rem;
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
  margin: 1.4rem 0 0 0;
  font-weight: normal;
  letter-spacing: 1px;

  padding: 36px 16px;
  color: #fff;
  background: #666;

  a {
    color: #ddd;
  }

  @media(max-width: 800px) {
    border-radius: 0;
    border-width: 1px 0;
    padding: 18px 4px;
  }
`;

export default Header;
