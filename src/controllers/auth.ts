import type { Request, Response } from 'express';
import { prismaClient } from '../lib/prisma.js';
import { hashSync, compareSync } from 'bcrypt';
import { createRequire } from 'node:module';
import { JWT_SECRET } from '../secrets.js';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');


export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validate that all required fields are provided
        if (!email || !password || !name) {
            res.status(400).json({ message: 'name, email, and password are required' });
            return;
        }

        // Check if a user with the same email already exists
        const existingUser = await prismaClient.user.findFirst({
            where: { email }
        });

        // If user already exists, return a 409 Conflict response
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        // Create a new user with the provided name, email, and hashed password
        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: hashSync(password, 10)
            }
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.log('Signup failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate that all required fields are provided
        if (!email || !password) {
            res.status(400).json({ message: 'email and password are required' });
            return;
        }
        // Check if a user with the provided email exists
        const user = await prismaClient.user.findFirst({ where: { email } });

        // If user does not exist, return a 404 Not Found response
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Check if the provided password matches the stored hashed password
        if (!user.password || !compareSync(password, user.password)) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);

        res.json({user, token });

    } catch (error) {
        console.log('Login failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
