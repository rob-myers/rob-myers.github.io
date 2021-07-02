function Foo() {
  return (
    <Bar area="baz">
      <>
        <div myattr="foo">Qux</div>
        <div myattr="foo">Qux</div>
      </>
    </Bar>
  );   
}

const Bar = styled(Foo)`
    background: red;
    grid-area: ${({ area }) => `my-${area}`};
    > .foo.bar {
        background: ${() => 'red'};
    }
`;
