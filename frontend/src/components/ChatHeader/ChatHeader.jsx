import { ChevronDown, Menu } from 'lucide-react';
import styles from './ChatHeader.module.css';

export default function ChatHeader({ user, onMenuClick }) {
  return (
    <header className={styles.header}>
      <button
        className={styles.menuButton}
        type='button'
        aria-label='Open navigation menu'
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>
      <div className={styles.left}>
        <span>የኛChat</span>
        <ChevronDown size={16} />
      </div>
      <div className={styles.right}>
        <div className={styles.avatar}>{user?.name?.slice(0, 1).toUpperCase()}</div>
      </div>
    </header>
  );
}
