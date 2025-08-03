import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import PrismaMock from "./PrismaMock";
import RedisMock from "./RedisMock";
import BcryptMock from "./BcryptMock";
import JwtMock from "./JwtMock";

class MockDIContainer {
    clear() {
        container.clearInstances();
    }

    register_all() {
        const prisma_mock = new PrismaMock();
        const redis_mock = new RedisMock();
        const bcrypt_mock = new BcryptMock();
        const jwt_mock = new JwtMock();

        container.registerInstance(PrismaClient, prisma_mock as unknown as PrismaClient);
        container.registerInstance("RedisClientPoolType", redis_mock);
        container.registerInstance("bcrypt_lib", bcrypt_mock);
        container.registerInstance("jwt_lib", jwt_mock);

        return {
            prisma_mock,
            redis_mock,
            bcrypt_mock,
            jwt_mock,
        };
    }
}

export default MockDIContainer;
