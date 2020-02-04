import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { RootState } from '@store/reducer';
import Index from '../pages/index';

import '@testing-library/jest-dom'; // TODO move to own file

const mockStore = configureStore<RootState>([]);

test('renders "Hello, world"', () => {
  const store = mockStore({ test: { count: 0, lastPing: null } });
  const { getByText } = render((
    <Provider store={store}>
      <Index />
    </Provider>
  ));
  const headerEl = getByText(/Hello, world/);
  // console.log({ headerEl });
  expect(headerEl).toBeInTheDocument();
});
