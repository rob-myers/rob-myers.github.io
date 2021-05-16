import styled from "@emotion/styled";

const Header: React.FC = () => {
  return <>
    <Title>
      Programmed Behaviour
    </Title>
  
    <Subtitle>
      Bot behaviour, step by step
    </Subtitle>
  </>;
};

const Title = styled.h1<{}>`
  margin-top: 3.5rem;
  margin-bottom: 0;
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
    font-size: 4rem;
    margin-left: 4px;
  }
`;

const Subtitle = styled.h3<{}>`
  margin: 1.4rem 0 3rem 0;
  font-weight: normal;
  font-size: 16px;
  letter-spacing: 2px;

  background-color: #766;
  color: #fff;
  border-radius: 5px 0 0 5px;
  padding: 8px 12px;
 
  @media(max-width: 1248px) {
    margin-bottom: 2rem;
  }
`;

export default Header;
