import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for CAPTCHA challenges
const captchaStore = new Map();

// Clean up expired tokens every minute
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of captchaStore.entries()) {
    if (now > data.expiresAt) {
      captchaStore.delete(token);
    }
  }
}, 60 * 1000);

const CATEGORIES = [
  {
    theme: 'Xe hơi',
    correct: ['🚗', '🚕', '🚙', '🏎️', '🚓'],
    distractors: ['🚲', '🛵', '✈️', '🚀', '🛴'],
  },
  {
    theme: 'Động vật',
    correct: ['🐕', '🐈', '🐎', '🐘', '🦁'],
    distractors: ['🌺', '🍎', '🏠', '⭐', '🎵'],
  },
  {
    theme: 'Trái cây',
    correct: ['🍎', '🍊', '🍋', '🍇', '🍓'],
    distractors: ['🚗', '🏠', '⭐', '🎵', '🔧'],
  },
  {
    theme: 'Hoa',
    correct: ['🌸', '🌺', '🌻', '🌹', '🌷'],
    distractors: ['🚗', '🍎', '🏠', '⭐', '🔧'],
  },
  {
    theme: 'Thể thao',
    correct: ['⚽', '🏀', '🎾', '🏐', '🏈'],
    distractors: ['🍎', '🌺', '🏠', '🚗', '🔧'],
  },
];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(arr, count) {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

// GET: Generate a CAPTCHA challenge
export async function GET() {
  try {
    // Pick a random category
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    // Pick 4 correct emojis and 5 distractors
    const correctEmojis = pickRandom(category.correct, 4);
    const distractorEmojis = pickRandom(category.distractors, 5);

    // Combine and shuffle, keeping track of correct positions
    const allEmojis = [...correctEmojis, ...distractorEmojis];
    const indices = allEmojis.map((emoji, i) => ({ emoji, isCorrect: i < 4 }));
    const shuffled = shuffle(indices);

    // Build images array and track correct IDs
    const images = shuffled.map((item, idx) => ({
      id: idx,
      emoji: item.emoji,
    }));
    const correctIds = shuffled
      .map((item, idx) => (item.isCorrect ? idx : -1))
      .filter((id) => id !== -1);

    // Generate token
    const token = crypto.randomUUID();

    // Store with 5-minute TTL
    captchaStore.set(token, {
      correctIds,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({
      token,
      theme: category.theme,
      images,
    });
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    return NextResponse.json(
      { error: 'Không thể tạo CAPTCHA' },
      { status: 500 }
    );
  }
}

// POST: Verify CAPTCHA
export async function POST(request) {
  try {
    const { token, selectedIds } = await request.json();

    if (!token || !selectedIds) {
      return NextResponse.json(
        { valid: false, error: 'Thiếu thông tin xác thực' },
        { status: 400 }
      );
    }

    const challenge = captchaStore.get(token);

    // Delete token immediately (one-time use)
    captchaStore.delete(token);

    if (!challenge) {
      return NextResponse.json(
        { valid: false, error: 'CAPTCHA đã hết hạn hoặc không hợp lệ' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > challenge.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'CAPTCHA đã hết hạn' },
        { status: 400 }
      );
    }

    // Verify selected IDs match correct IDs
    const sortedSelected = [...selectedIds].sort((a, b) => a - b);
    const sortedCorrect = [...challenge.correctIds].sort((a, b) => a - b);

    const valid =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((id, idx) => id === sortedCorrect[idx]);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Lỗi xác thực CAPTCHA' },
      { status: 500 }
    );
  }
}

// Export for internal use by forgot-password API
export { captchaStore };
