function Foo() {
  const foo = `ok ${4}`;
  return (
    <Bar area="baz">
      <>
        <div myattr="foo">Qux</div>
        <div myattr="foo">Qux</div>
      </>
    </Bar>
  );   
}

const Bar = styled.div`
    background: red;
    grid-area: ${({ enabled }) => enabled ? 'foo' : 'bar'};

		.classA, .myClass  {
    	color: red;
      grid-area: red;
    }
`;
