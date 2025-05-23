import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { createClientPool } from "redis";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface ICredentials {
    login?: unknown;
    password?: unknown;
}

interface ICredentialsNormalized {
    login: string;
    password: string;
}

export class SignUpController {
    async handle(req: Request, res: Response) {
        const credentials = SignUpController.normalizeCredentials(req.body);
        const SALT_ROUNDS = 12;
        const password_hash = await bcrypt.hash(credentials.password, SALT_ROUNDS);
        
        // connecting to redis before trying saving the user to assure the session can be persisted
        const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL;
        const redis = createClientPool({ url: REDIS_CONNECTION_URL  })
        await redis.connect();
        
        // try to save user on database, could trhow a non unique constraint error
        const prisma = new PrismaClient();
        const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE ?? "USER";
        const user = await prisma.user.create({
            data: {
                login: credentials.login,
                hashed_password: password_hash,
                role: {
                    connectOrCreate: {
                        where: {
                            role: DEFAULT_USER_ROLE,
                        },
                        create: {
                            role: DEFAULT_USER_ROLE,
                        }
                    }
                },
            },
            include: {
                role: true,
            },
        });

        // generate signed jwt
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? "insecure_key_611c4aa012a4fe291fd5498c96f24c9b";
        const refresh_token = jwt.sign({
            user_uid: user.uid,
            user_login: user.login,
            user_role: user.role.role,
        }, JWT_SECRET_KEY);

        // save user session
        await redis.set(`session:${user.uid}`, refresh_token);
        redis.destroy();

        res.send({ refresh_token });
    }

    private static normalizeCredentials(credentials: ICredentials): ICredentialsNormalized {
        // type checking
        if (typeof(credentials.login) !== "string") throw new Error("Login must be a string value");
        if (typeof(credentials.password) !== "string") throw new Error("Password must be a string vlaue");
        // login validation
        const login: string = credentials.login;
        const isLoginCharactersValid = !!login.match(/[0-9a-zA-Z._\-]/g);
        if (!isLoginCharactersValid) throw new Error("Login must have only valid characters [0-9a-zA-Z._-]");
        const isLoginLengthValid = login.length >= 5 && login.length <= 100;
        if (!isLoginLengthValid) throw new Error("Login must have between 5 and 100 characters (both included)");
        // password validation
        const password: string = credentials.password;
        const isPasswordCharactersLengthValid = password.length >= 8;
        if (!isPasswordCharactersLengthValid) throw new Error("Password must have at least 8 characters");
        const isPasswordByteLengthValid = new Blob([ password ]).size <= 72;
        if (!isPasswordByteLengthValid) throw new Error("Password cannot have more than 72 bytes");
        
        return { login, password };
    }
}