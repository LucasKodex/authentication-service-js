import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import PrismaMock from "./PrismaMock";
import RedisMock from "./RedisMock";
import JwtMock from "./JwtMock";
import Argon2Mock from "./Argon2Mock";

class MockDIContainer {
    clear() {
        container.clearInstances();
    }

    register_all() {
        const prisma_mock = new PrismaMock();
        const redis_mock = new RedisMock();
        const argon2_mock = new Argon2Mock();
        const jwt_mock = new JwtMock();

        container.registerInstance(PrismaClient, prisma_mock as unknown as PrismaClient);
        container.registerInstance("RedisClientPoolType", redis_mock);
        container.registerInstance("argon2_lib", argon2_mock);
        container.registerInstance("jwt_lib", jwt_mock);

        return {
            prisma_mock,
            redis_mock,
            argon2_mock,
            jwt_mock,
        };
    }
}

export default MockDIContainer;
