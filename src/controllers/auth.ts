import type { Request, Response } from 'express';
import { prismaClient } from '../lib/prisma.js';
import { hashSync } from 'bcrypt';

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
        console.error('Signup failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
