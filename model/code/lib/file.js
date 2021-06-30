function Foo() {
  return (
    <Bar area="baz">
      <div>Qux</div>
    </Bar>
  );   
}

const Bar = styled(Foo)`
    background: red;
    grid-area: ${({ area }) => area};
`;
