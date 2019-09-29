/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import React from "react";
import Link from "next/link"; // ?
import { useSelector } from "react-redux";

interface Props {}

// const rootPath = `/`;

const Title: React.FC<Props> = ({ children }) => {
  const location = useSelector(({ router: { location } }) => location);
  console.log({ location });

  return (
    <Styled.h1
      sx={{
        my: 0,
        fontSize: 4
        // background: "red"
      }}
    >
      <Link href="/">
        <Styled.a
          sx={{
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`
          }}
          href={`/`}
        >
          {children}
        </Styled.a>
      </Link>
    </Styled.h1>
  );

  // if (location.pathname === rootPath) {
  //   return (
  //     <Styled.h1
  //       css={css({
  //         my: 0,
  //         fontSize: 4
  //       })}
  //     >
  //       <Styled.a
  //         as={Link}
  //         css={{
  //           color: `inherit`,
  //           boxShadow: `none`,
  //           textDecoration: `none`
  //         }}
  //         href={`/`}
  //       >
  //         {children}
  //       </Styled.a>
  //     </Styled.h1>
  //   );
  // } else {
  //   return (
  //     <Styled.h3
  //       as="p"
  //       css={css({
  //         my: 0
  //       })}
  //     >
  //       <Styled.a
  //         as={Link}
  //         css={css({
  //           boxShadow: `none`,
  //           textDecoration: `none`,
  //           color: `primary`
  //         })}
  //         href={`/`}
  //       >
  //         {children}
  //       </Styled.a>
  //     </Styled.h3>
  //   );
  // }
};

export default Title;
