import Room, { TransformProps as Props } from './room';

export const Closet: React.FC<Props> =
  (props) => <Room id="closet" {...props} />;

export const Junction: React.FC<Props> =
  (props) => <Room id="junction" {...props} />;

export const Fourway: React.FC<Props> =
  (props) => <Room id="fourway" {...props} />;

export const Corner: React.FC<Props> =
  (props) => <Room id="corner" {...props} />;

export const Straight: React.FC<Props> =
  (props) => <Room id="straight" {...props} />;
