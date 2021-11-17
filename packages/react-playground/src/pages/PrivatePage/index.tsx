import React from 'react';

import styles from './index.module.scss';

const PrivatePage = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Private Page</div>
      <div className={styles.content}> Authentication is required for this page</div>
      <button
        type="button"
        onClick={() => {
          window.location.assign('/');
        }}
      >
        Home
      </button>
    </div>
  );
};

export default PrivatePage;
