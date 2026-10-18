import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ user, onSignOut, isOpen, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <button className={styles.iconBtn} type='button' onClick={onClose} aria-label='Close navigation menu'>
            <PanelLeftClose size={20} />
          </button>
        </div>
        <button className={styles.iconBtn} type='button' onClick={onClose} aria-label='Close navigation menu'>
          <MessageSquare size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        <a href='#' className={styles.item} onClick={onClose}>
          <MessageSquare size={18} />
          <span>New chat</span>
        </a>
        <a href='#' className={styles.item} onClick={onClose}>
          <Search size={18} />
          <span>Search chats</span>
        </a>
        <a href='#' className={styles.item}>
          <ImageIcon size={18} />
          <span>Images</span>
        </a>
        <a href='#' className={styles.item}>
          <LayoutGrid size={18} />
          <span>Apps</span>
        </a>
        <a href='#' className={styles.item}>
          <Microscope size={18} />
          <span>Deep research</span>
        </a>
        <a href='#' className={styles.item}>
          <Code2 size={18} />
          <span>Codex</span>
        </a>
        <a href='#' className={styles.item}>
          <FolderKanban size={18} />
          <span>Projects</span>
        </a>
      </nav>

      {user && (
        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userPlan}>{user.email}</span>
            </div>
          </div>
          <button className={styles.signOut} type='button' onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
