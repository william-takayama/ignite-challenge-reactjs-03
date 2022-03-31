import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={[styles.header, commonStyles.container].join(' ')}>
      <Link href="/">
        <a className={styles.logo}>
          <Image src="/images/logo.svg" alt="logo" width="238" height="25" />
        </a>
      </Link>
    </header>
  );
}
