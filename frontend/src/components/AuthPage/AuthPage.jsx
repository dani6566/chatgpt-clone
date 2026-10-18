import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../api';
import styles from './AuthPage.module.css';

export default function AuthPage({ onAuthenticated, initialError = '' }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering ? { name, email, password } : { email, password };
      const response = await api.post(endpoint, payload);
      onAuthenticated(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isRegistering ? 'login' : 'register');
    setError('');
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby='auth-title'>
        <div className={styles.brand}>
          <span className={styles.brandIcon}><MessageSquare size={22} /></span>
          <span>የኛChat</span>
        </div>
        <h1 id='auth-title'>{isRegistering ? 'Create your account' : 'Welcome back'}</h1>
        <p className={styles.subtitle}>
          {isRegistering
            ? 'Sign up to start your own conversations.'
            : 'Sign in to continue your conversations.'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegistering && (
            <label className={styles.field}>
              <span>Your name</span>
              <input
                autoComplete='name'
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder='Name'
              />
            </label>
          )}
          <label className={styles.field}>
            <span>Email</span>
            <input
              type='email'
              autoComplete='email'
              required
              maxLength={254}
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder='you@example.com'
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type='password'
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
              minLength={isRegistering ? 8 : undefined}
              maxLength={128}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder={isRegistering ? 'At least 8 characters' : 'Your password'}
            />
          </label>
          {error && <p className={styles.error} role='alert'>{error}</p>}
          <button className={styles.submit} type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className={styles.switch}>
          {isRegistering ? 'Already have an account?' : 'New here?'}
          <button type='button' onClick={switchMode}>
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
}
