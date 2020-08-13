const ExternalLink: React.FC<Props> = ({ children, ...props }) => (
  <a target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

interface Props extends React.HTMLProps<HTMLAnchorElement> {}

export default ExternalLink
