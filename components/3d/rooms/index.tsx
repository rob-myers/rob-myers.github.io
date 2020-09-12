import Room, { RoomTransformProps as Props } from './room';

export const Closet: React.FC<Props> =
  (props) => <Room is="closet" {...props} />;

export const Junction: React.FC<Props> =
  (props) => <Room is="junction" {...props} />;

export const Fourway: React.FC<Props> =
  (props) => <Room is="fourway" {...props} />;

export const Corner: React.FC<Props> =
  (props) => <Room is="corner" {...props} />;

export const Straight: React.FC<Props> =
  (props) => <Room is="straight" {...props} />;
