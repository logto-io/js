import styles from './app.scss';

export const init = (element) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  element.innerHTML = `<h1 class="${styles.app}">Hello world!</h1>`;
};
