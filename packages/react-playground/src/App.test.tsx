import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import App from './App';

describe('<App />', () => {
  test('renders without exploding', () => {
    const div = document.createElement('div');
    expect(() => {
      ReactDOM.render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
        div
      );
    }).not.toThrow();
  });
});
