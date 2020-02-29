import { Session } from '@components/xterm/session';

const Demo2: React.FC = () => {

  if (typeof window === 'undefined') return null;

  return (
    <div>
      <Session uid="demo-2" userKey="ged" />
    </div>
  );
};

export default Demo2;
