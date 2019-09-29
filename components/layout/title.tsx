import React from "react";
import { Styled } from "theme-ui";
import { css } from "@emotion/core";
import Link from "next/link"; // ?
import { useSelector } from "react-redux";

interface Props {}

// const rootPath = `${__PATH_PREFIX__}/`
const rootPath = `/`;

const Title: React.FC<Props> = ({ children }) => {
  const location = useSelector(({ router: { location } }) => location);

  if (location.pathname === rootPath) {
    return (
      <Styled.h1
        css={css({
          my: 0,
          fontSize: 4
        })}
      >
        <Styled.a
          as={Link}
          css={{
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`
          }}
          href={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h1>
    );
  } else {
    return (
      <Styled.h3
        as="p"
        css={css({
          my: 0
        })}
      >
        <Styled.a
          as={Link}
          css={css({
            boxShadow: `none`,
            textDecoration: `none`,
            color: `primary`
          })}
          href={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h3>
    );
  }
};

export default Title;
