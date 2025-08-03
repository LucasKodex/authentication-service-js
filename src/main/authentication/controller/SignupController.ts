import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { RedisClientPoolType } from "redis";
import jwt from "jsonwebtoken";
import { autoInjectable, inject } from "tsyringe";
import argon2 from "argon2";

interface ICredentials {
    login?: unknown;
    password?: unknown;
}

interface ICredentialsNormalized {
    login: string;
    password: string;
}

@autoInjectable()
export class SignupController {
    constructor (
        private readonly prisma?: PrismaClient,
        @inject("RedisClientPoolType") private readonly redis?: RedisClientPoolType,
        @inject("argon2_lib") private readonly argon2_lib?: typeof argon2,
        @inject("jwt_lib") private readonly jwt_lib?: typeof jwt,
    ) {};

    async handle(req: Request, res: Response) {
        const credentials = SignupController.normalizeCredentials(req.body);
        const password_hash = await this.argon2_lib!.hash(credentials.password);
        
        // try to save user on database, could trhow a non unique constraint error
        const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE ?? "USER";
        const user = await this.prisma!.user.create({
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
        const refresh_token = this.jwt_lib!.sign({
            user_uid: user.uid,
            user_login: user.login,
            user_role: user.role.role,
        }, JWT_SECRET_KEY);

        // save user session
        await this.redis!.set(`session:${user.uid}`, refresh_token);

        res
            .status(201)
            .send({ refresh_token });
    }

    private static normalizeCredentials(credentials: ICredentials): ICredentialsNormalized {
        // type checking
        if (typeof(credentials.login) !== "string") throw new Error("Login must be a string value");
        if (typeof(credentials.password) !== "string") throw new Error("Password must be a string value");
        // login validation
        const login: string = credentials.login;
        const isLoginCharactersValid = !/[^0-9a-zA-Z._\-]/g.test(login);
        if (!isLoginCharactersValid) throw new Error("Login must have only valid characters [0-9a-zA-Z._-]");
        const isLoginLengthValid = login.length >= 5 && login.length <= 100;
        if (!isLoginLengthValid) throw new Error("Login must have between 5 and 100 characters (both included)");
        // password validation
        const password: string = credentials.password;
        const isPasswordCharactersLengthValid = password.length >= 8;
        if (!isPasswordCharactersLengthValid) throw new Error("Password must have at least 8 characters");
        
        return { login, password };
    }
}