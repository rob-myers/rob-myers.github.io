export default function Link(props: Props) {
  return (
    <a
      href={props.href}
      title={props.title}
      {...props.openNewTab && {
        className: 'new-tab-link',
        target: '_blank',
        rel: 'noopener',
      }}
    >
      {props.children}
    </a>
  )
}

type Props = React.PropsWithChildren<{
  href: string;
  title?: string;
  openNewTab?: boolean;
}>;