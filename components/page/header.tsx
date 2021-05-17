import styled from "@emotion/styled";

const Header: React.FC = () => {
  return <>
    <Title>
      Programmed Behaviour
    </Title>
  
    <Subtitle>
      Building bot behaviour, step by step
    </Subtitle>
  </>;
};

const Title = styled.h1<{}>`
  margin-top: 3.5rem;
  margin-bottom: 2rem;
  line-height: 1;
  font-size: 6rem;
  max-width: 800px;
  color: #222;

  @media(max-width: 1248px) {
    margin-top: 2.5rem;
    font-size: 5rem;
    max-width: 400px;
  }

  @media(max-width: 800px) {
    margin-top: 0.5rem;
  }
  @media(max-width: 500px) {
    font-size: 4rem;
  }
`;

const Subtitle = styled.div<{}>`
  margin: 1.4rem 0 3rem 0;
  font-weight: normal;
  letter-spacing: 1px;

  border-radius: 5px;
  padding: 6px 10px;
  border: #bcc 1px solid;
  color: #777;
  background-image: linear-gradient(45deg, #ededed 3.85%, #ffffff 3.85%, #ffffff 50%, #ededed 50%, #ededed 53.85%, #ffffff 53.85%, #ffffff 100%);
  background-size: 8.38px 8.38px;

  @media(max-width: 1248px) {
    margin-bottom: 2rem;
  }
  @media(max-width: 800px) {
    border-radius: 0;
    border-width: 1px 0;
    margin-bottom: 2rem;
  }
`;

export default Header;
