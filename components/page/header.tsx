import styled from "@emotion/styled";

const Header: React.FC = () => {
  return <>
    <Title>
      three.js CLI
    </Title>
  
    <Subtitle>
      A command line interface for three.js
    </Subtitle>
  </>;
};

const Title = styled.h1<{}>`
  margin-top: 3.5rem;
  margin-bottom: 2rem;
  line-height: 1;
  font-size: 6rem;
  color: #222;

  @media(max-width: 1248px) {
    margin-top: 2.5rem;
    font-size: 5rem;
  }

  @media(max-width: 800px) {
    margin-top: 1rem;
  }
  @media(max-width: 500px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.div<{}>`
  margin: 1.4rem 0 3rem 0;
  font-weight: normal;
  letter-spacing: 1px;

  border-radius: 5px;
  padding: 16px;
  border: #aaa 1px solid;
  color: #333;
  background-image: linear-gradient(45deg, #ededed 3.85%, #ffffff 3.85%, #ffffff 50%, #ededed 50%, #ededed 53.85%, #ffffff 53.85%, #ffffff 100%);
  background-size: 8.38px 8.38px;

  @media(max-width: 1248px) {
    margin-bottom: 2rem;
  }
  @media(max-width: 800px) {
    border-radius: 0;
    border-width: 1px 0;
    margin-bottom: 2rem;
    padding: 18px 4px;
  }
`;

export default Header;
