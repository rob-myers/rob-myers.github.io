import { useDispatch } from 'react-redux';
import css from './env.scss';

const EnvKeys: React.FC<Props> = ({ envKey, children}) => {
  const dispatch = useDispatch();

  return (
    <div
      className={css.keys}
      onKeyUp={(e) => {
        const _env = dispatch({ type: '[env] get env', args: { envKey } })!;
        console.log({ key: e.key });
        /**
         * Can react to keypresses here.
         */
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

interface Props {
  envKey: string;
}

export default EnvKeys;
