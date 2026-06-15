'use client';

import { useState } from 'react';

export default function NewsletterForm({ styles }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: Integrate with actual newsletter API
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form className={styles.newsletterForm} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Nhập email của bạn..."
        className={styles.newsletterInput}
        id="newsletter-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" id="newsletter-submit">
        {submitted ? '✓ Đã đăng ký!' : 'Đăng ký'}
      </button>
    </form>
  );
}
