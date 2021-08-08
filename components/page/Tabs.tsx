export function Tabs({}: Props) {
  // TODO
  return null;
}

interface Props {
  tabs: TabMeta[];
}

type TabMeta = (
  | { key: 'code'; filepath: string }
  | { key: 'component'; componentKey: string }
)
