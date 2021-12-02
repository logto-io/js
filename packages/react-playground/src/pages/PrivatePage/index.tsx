import queryString from 'query-string';
import React, { useEffect } from 'react';

import styles from './index.module.scss';

const PrivatePage = () => {
  useEffect(() => {
    if (window.location.href.includes('?')) {
      const { url: baseUrl, query: queryObject } = queryString.parseUrl(window.location.href);
      if (baseUrl && Object.keys(queryObject).length > 0) {
        const { code, state, ...filteredEntries } = queryObject;
        const newUrl = queryString.stringifyUrl({ url: baseUrl, query: filteredEntries });
        history.replaceState(history.state, '', newUrl);
      }
    }
  }, []);

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
