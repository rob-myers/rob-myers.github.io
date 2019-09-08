/**
 * - Creating a page named _error.js lets you override HTTP error messages,
 *   see https://github.com/iaincollins/nextjs-starter/blob/master/pages/_error.js
 * - We simply redirect to the root page.
 */

import React, { useEffect } from "react";
import { useRouter } from "next/router";

const ErrorPage: React.FunctionComponent = ({ res, xhr }: any) => {
  const router = useRouter();
  useEffect(() => void router.push("/"), []);
  return null;
};

export default ErrorPage;
