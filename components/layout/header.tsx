import React from "react";
import { css, useColorMode } from "theme-ui";
import Title from "./title";
import Switch from "./switch";
import { checkedIcon, uncheckedIcon } from "./icons";
// import { useSelector } from "react-redux";

export interface Props {
  title: string;
}

const Header: React.FC<Props> = ({ children, title, ...props }) => {
  // const location = useSelector(({ router: { location } }) => location);

  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === `dark`;
  const toggleColorMode = (e: any) => setColorMode(isDark ? `light` : `dark`);

  return (
    <header>
      <div
        sx={{
          maxWidth: `container`,
          mx: `auto`,
          px: 3,
          pt: 4
        }}
      >
        <div
          sx={{
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `baseline`,
            mb: 4
          }}
        >
          <Title>{title}</Title>
          {children}
          <Switch
            aria-label="Toggle dark mode"
            css={css({
              bg: `black`
            })}
            checkedIcon={checkedIcon}
            uncheckedIcon={uncheckedIcon}
            checked={isDark}
            onChange={toggleColorMode}
          />
        </div>
        {/* {location.pathname === rootPath && <Bio />} */}
      </div>
    </header>
  );
};

export default Header;
