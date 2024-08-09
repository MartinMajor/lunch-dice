import React from 'react';
import styles from './Spinner.module.scss';

type Props = {
  className?: string;
};

export const Spinner = React.memo((props: Props) => {
  return (
    // biome-ignore lint/nursery/useSortedClasses: Class names are sorted properly
    <span className={`${styles.Spinner} ${props.className ?? ''}`}>
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
});
