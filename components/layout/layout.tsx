import React from "react";
import { Styled, css } from "theme-ui";
import Header, { Props as HeaderProps } from "./header";

interface Props extends HeaderProps {
  // ...
}

/**
 * TODO understand `Styled.root`.
 */
const Layout: React.FC<Props> = ({ children, ...props }) => (
  <Styled.root>
    <Header {...props} />
    <div>
      <div
        css={css({
          maxWidth: `container`,
          mx: `auto`,
          px: 3,
          py: 4
        })}
      >
        {children}
      </div>
    </div>
  </Styled.root>
);

export default Layout;
