import { useEffect } from "react";

export default function Loadable({ children, onLoaded }: Props) {
  useEffect(() => void onLoaded?.(),[]);
  return children as JSX.Element;
}

type Props = React.PropsWithChildren<{ onLoaded?: () => void }>;
