import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import db from '../../../db/db.config.js';

const scrypt = promisify(scryptCallback);
const TOKEN_LIFETIME = '7d';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
        const error = new Error('JWT_SECRET must be set to a random value of at least 32 characters');
        error.status = 500;
        throw error;
    }
    return secret;
}

function createAccessToken(userId) {
    return jwt.sign({}, getJwtSecret(), {
        algorithm: 'HS256',
        expiresIn: TOKEN_LIFETIME,
        subject: String(userId),
    });
}

export function verifyAccessToken(token) {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !/^[1-9]\d*$/.test(payload.sub) ||
        !Number.isInteger(payload.exp)) {
        throw new Error('Invalid access token');
    }
    return payload.sub;
}

async function hashPassword(password) {
    const salt = randomBytes(16);
    const derivedKey = await scrypt(password, salt, 64);
    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    const [saltHex, hashHex] = storedHash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, salt, expected.length);
    return expected.length > 0 && timingSafeEqual(expected, actual);
}

function toPublicUser(row) {
    return { id: row.id, name: row.name, email: row.email };
}

export async function registerUser({ name, email, password }) {
    getJwtSecret();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 80) {
        const error = new Error('Name must be between 2 and 80 characters');
        error.status = 400;
        throw error;
    }
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        const error = new Error('Enter a valid email address');
        error.status = 400;
        throw error;
    }
    if (password.length < 8 || password.length > 128) {
        const error = new Error('Password must be between 8 and 128 characters');
        error.status = 400;
        throw error;
    }

    const passwordHash = await hashPassword(password);
    try {
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [normalizedName, normalizedEmail, passwordHash],
        );
        const user = { id: result.insertId, name: normalizedName, email: normalizedEmail };
        return { user, token: createAccessToken(user.id) };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const conflict = new Error('An account with this email already exists');
            conflict.status = 409;
            throw conflict;
        }
        throw error;
    }
}

export async function loginUser({ email, password }) {
    getJwtSecret();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || password.length > 128) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }
    const [rows] = await db.execute(
        'SELECT id, name, email, password_hash FROM users WHERE email = ?',
        [normalizedEmail],
    );
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const publicUser = toPublicUser(user);
    return { user: publicUser, token: createAccessToken(publicUser.id) };
}

export async function getUserById(id) {
    const [rows] = await db.execute(
        'SELECT id, name, email FROM users WHERE id = ?',
        [id],
    );
    return rows[0] || null;
}
