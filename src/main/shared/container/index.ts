import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import { createClientPool } from "redis";
import { container } from "tsyringe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class ContainerWrapper {
    private _container;

    constructor() {
        this._container = container;
    }

    initialize() {
        const prisma = new PrismaClient();
        this._container.registerInstance(PrismaClient, prisma);

        const redis = createClientPool({ url: process.env.REDIS_CONNECTION_URL  });
        redis.connect();
        this._container.registerInstance("RedisClientPoolType", redis);

        this._container.registerInstance("bcrypt_lib", bcrypt);

        this._container.registerInstance("jwt_lib", jwt);
    }
}

export default ContainerWrapper;
