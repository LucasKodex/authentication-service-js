import "reflect-metadata";
import { App } from "../../main/app";
import request from "supertest";
import MockDIContainer from "../shared/mocks/MockDIContainer";
import { Application } from "express";
import PrismaMock from "../shared/mocks/PrismaMock";
import RedisMock from "../shared/mocks/RedisMock";
import Argon2Mock from "../shared/mocks/Argon2Mock";
import JwtMock from "../shared/mocks/JwtMock";
import { faker } from '@faker-js/faker';
import { randomUUID } from "node:crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const SIGNUP_ENDPOINT = "/signup";

describe("POST /signup", function () {
    let app: Application;
    let prisma_mock: PrismaMock;
    let redis_mock: RedisMock;
    let argon2_mock: Argon2Mock;
    let jwt_mock: JwtMock;

    const VALID_LOGIN_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-";
    const MIN_LOGIN_LENGTH = 5;
    const MAX_LOGIN_LENGTH = 100;
    const MIN_PASSWORD_LENGTH = 8;

    beforeAll(function () {
        const mock_di_container = new MockDIContainer();
        mock_di_container.clear();
        ({
            prisma_mock,
            redis_mock,
            argon2_mock,
            jwt_mock,
        } = mock_di_container.register_all());
        app = new App().app;
    });

    beforeEach(function () {
        jest.clearAllMocks();
    });

    it("should return a refresh token when registered", async function () {
        // spying mocked dependecy injection
        const MOCKED_CREATED_USER = {
            uid: randomUUID(),
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
            hashed_password: "$argon2id$v=19$m=65536,t=3,p=4$GyEdQCgy7miuGRhpWC4Z6w$lVFRrcxFwltIn6S+ECOjQqsG1anZWiLZje0d2p9+U4M",
            role_uid: randomUUID(),
            role: {
                uid: randomUUID(),
                role: "USER",
            },
        };
        prisma_mock.user.create.mockReturnValue(MOCKED_CREATED_USER);

        argon2_mock.hash.mockReturnValue(MOCKED_CREATED_USER.hashed_password);

        const MOCKED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VpZCI6ImI4ODViNDMxLTVhYjQtNDg3Mi04ODY4LWM2ODEzMmM5MzkwZiIsInVzZXJfbG9naW4iOiJtb2NrZWQudXNlciIsInVzZXJfcm9sZSI6Ik1PQ0tFRF9VU0VSIiwiaWF0IjoxMDY4NzQzNDYzfQ.Rg_b6sVDIIIOGaMHt0LDUntpvuTmxMeDfgatLhz8xnY";
        jwt_mock.sign .mockReturnValue(MOCKED_JWT_TOKEN)

        

        const request_body = {
            login: MOCKED_CREATED_USER.login,
            password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(201);
        
        const EXPECTED_DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE;

        expect(argon2_mock.hash).toHaveBeenCalledWith(request_body.password);
        expect(argon2_mock.hash).toHaveReturnedWith(MOCKED_CREATED_USER.hashed_password);

        expect(prisma_mock.user.create).toHaveBeenCalledWith({
            data: {
                login: request_body.login,
                hashed_password: MOCKED_CREATED_USER.hashed_password,
                role: {
                    connectOrCreate: {
                        where: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                        create: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                    },
                },
            },
            include: {
                role: true,
            },
        });

        expect(jwt_mock.sign).toHaveBeenLastCalledWith({
            user_uid: MOCKED_CREATED_USER.uid,
            user_login: request_body.login,
            user_role: EXPECTED_DEFAULT_USER_ROLE,
        }, process.env.JWT_SECRET_KEY);

        expect(redis_mock.set).toHaveBeenCalledWith(`session:${MOCKED_CREATED_USER.uid}`, MOCKED_JWT_TOKEN);

        const response_body = response.body;
        expect(response_body).toHaveProperty("refresh_token", MOCKED_JWT_TOKEN);
    });

    it(`should register a user with a ${MIN_LOGIN_LENGTH} character login`, async function () {
        // spying mocked dependecy injection
        const MOCKED_CREATED_USER = {
            uid: randomUUID(),
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, MIN_LOGIN_LENGTH),
            hashed_password: "$argon2id$v=19$m=65536,t=3,p=4$GyEdQCgy7miuGRhpWC4Z6w$lVFRrcxFwltIn6S+ECOjQqsG1anZWiLZje0d2p9+U4M",
            role_uid: randomUUID(),
            role: {
                uid: randomUUID(),
                role: "USER",
            },
        };
        prisma_mock.user.create.mockReturnValue(MOCKED_CREATED_USER);

        argon2_mock.hash.mockReturnValue(MOCKED_CREATED_USER.hashed_password);

        const MOCKED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VpZCI6ImI4ODViNDMxLTVhYjQtNDg3Mi04ODY4LWM2ODEzMmM5MzkwZiIsInVzZXJfbG9naW4iOiJtb2NrZWQudXNlciIsInVzZXJfcm9sZSI6Ik1PQ0tFRF9VU0VSIiwiaWF0IjoxMDY4NzQzNDYzfQ.Rg_b6sVDIIIOGaMHt0LDUntpvuTmxMeDfgatLhz8xnY";
        jwt_mock.sign .mockReturnValue(MOCKED_JWT_TOKEN)

        

        const request_body = {
            login: MOCKED_CREATED_USER.login,
            password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(201);
        
        const EXPECTED_DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE;

        expect(argon2_mock.hash).toHaveBeenCalledWith(request_body.password);
        expect(argon2_mock.hash).toHaveReturnedWith(MOCKED_CREATED_USER.hashed_password);

        expect(prisma_mock.user.create).toHaveBeenCalledWith({
            data: {
                login: request_body.login,
                hashed_password: MOCKED_CREATED_USER.hashed_password,
                role: {
                    connectOrCreate: {
                        where: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                        create: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                    },
                },
            },
            include: {
                role: true,
            },
        });

        expect(jwt_mock.sign).toHaveBeenLastCalledWith({
            user_uid: MOCKED_CREATED_USER.uid,
            user_login: request_body.login,
            user_role: EXPECTED_DEFAULT_USER_ROLE,
        }, process.env.JWT_SECRET_KEY);

        expect(redis_mock.set).toHaveBeenCalledWith(`session:${MOCKED_CREATED_USER.uid}`, MOCKED_JWT_TOKEN);

        const response_body = response.body;
        expect(response_body).toHaveProperty("refresh_token", MOCKED_JWT_TOKEN);
    });

    it(`should register a user with a ${MAX_LOGIN_LENGTH} character login`, async function () {
        // spying mocked dependecy injection
        const MOCKED_CREATED_USER = {
            uid: randomUUID(),
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, MAX_LOGIN_LENGTH),
            hashed_password: "$argon2id$v=19$m=65536,t=3,p=4$GyEdQCgy7miuGRhpWC4Z6w$lVFRrcxFwltIn6S+ECOjQqsG1anZWiLZje0d2p9+U4M",
            role_uid: randomUUID(),
            role: {
                uid: randomUUID(),
                role: "USER",
            },
        };
        prisma_mock.user.create.mockReturnValue(MOCKED_CREATED_USER);

        argon2_mock.hash.mockReturnValue(MOCKED_CREATED_USER.hashed_password);

        const MOCKED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VpZCI6ImI4ODViNDMxLTVhYjQtNDg3Mi04ODY4LWM2ODEzMmM5MzkwZiIsInVzZXJfbG9naW4iOiJtb2NrZWQudXNlciIsInVzZXJfcm9sZSI6Ik1PQ0tFRF9VU0VSIiwiaWF0IjoxMDY4NzQzNDYzfQ.Rg_b6sVDIIIOGaMHt0LDUntpvuTmxMeDfgatLhz8xnY";
        jwt_mock.sign .mockReturnValue(MOCKED_JWT_TOKEN)

        

        const request_body = {
            login: MOCKED_CREATED_USER.login,
            password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(201);
        
        const EXPECTED_DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE;

        expect(argon2_mock.hash).toHaveBeenCalledWith(request_body.password);
        expect(argon2_mock.hash).toHaveReturnedWith(MOCKED_CREATED_USER.hashed_password);

        expect(prisma_mock.user.create).toHaveBeenCalledWith({
            data: {
                login: request_body.login,
                hashed_password: MOCKED_CREATED_USER.hashed_password,
                role: {
                    connectOrCreate: {
                        where: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                        create: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                    },
                },
            },
            include: {
                role: true,
            },
        });

        expect(jwt_mock.sign).toHaveBeenLastCalledWith({
            user_uid: MOCKED_CREATED_USER.uid,
            user_login: request_body.login,
            user_role: EXPECTED_DEFAULT_USER_ROLE,
        }, process.env.JWT_SECRET_KEY);

        expect(redis_mock.set).toHaveBeenCalledWith(`session:${MOCKED_CREATED_USER.uid}`, MOCKED_JWT_TOKEN);

        const response_body = response.body;
        expect(response_body).toHaveProperty("refresh_token", MOCKED_JWT_TOKEN);
    });

    
    it(`should register a user with a ${MIN_PASSWORD_LENGTH} character password`, async function () {
        // spying mocked dependecy injection
        const MOCKED_CREATED_USER = {
            uid: randomUUID(),
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, MIN_LOGIN_LENGTH),
            hashed_password: "$argon2id$v=19$m=65536,t=3,p=4$GyEdQCgy7miuGRhpWC4Z6w$lVFRrcxFwltIn6S+ECOjQqsG1anZWiLZje0d2p9+U4M",
            role_uid: randomUUID(),
            role: {
                uid: randomUUID(),
                role: "USER",
            },
        };
        prisma_mock.user.create.mockReturnValue(MOCKED_CREATED_USER);

        argon2_mock.hash.mockReturnValue(MOCKED_CREATED_USER.hashed_password);

        const MOCKED_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VpZCI6ImI4ODViNDMxLTVhYjQtNDg3Mi04ODY4LWM2ODEzMmM5MzkwZiIsInVzZXJfbG9naW4iOiJtb2NrZWQudXNlciIsInVzZXJfcm9sZSI6Ik1PQ0tFRF9VU0VSIiwiaWF0IjoxMDY4NzQzNDYzfQ.Rg_b6sVDIIIOGaMHt0LDUntpvuTmxMeDfgatLhz8xnY";
        jwt_mock.sign .mockReturnValue(MOCKED_JWT_TOKEN)

        const request_body = {
            login: MOCKED_CREATED_USER.login,
            password: faker.internet.password({ length: MIN_PASSWORD_LENGTH }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(201);
        
        const EXPECTED_DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE;

        expect(argon2_mock.hash).toHaveBeenCalledWith(request_body.password);
        expect(argon2_mock.hash).toHaveReturnedWith(MOCKED_CREATED_USER.hashed_password);

        expect(prisma_mock.user.create).toHaveBeenCalledWith({
            data: {
                login: request_body.login,
                hashed_password: MOCKED_CREATED_USER.hashed_password,
                role: {
                    connectOrCreate: {
                        where: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                        create: {
                            role: EXPECTED_DEFAULT_USER_ROLE,
                        },
                    },
                },
            },
            include: {
                role: true,
            },
        });

        expect(jwt_mock.sign).toHaveBeenLastCalledWith({
            user_uid: MOCKED_CREATED_USER.uid,
            user_login: request_body.login,
            user_role: EXPECTED_DEFAULT_USER_ROLE,
        }, process.env.JWT_SECRET_KEY);

        expect(redis_mock.set).toHaveBeenCalledWith(`session:${MOCKED_CREATED_USER.uid}`, MOCKED_JWT_TOKEN);

        const response_body = response.body;
        expect(response_body).toHaveProperty("refresh_token", MOCKED_JWT_TOKEN);
    });

    it("should not register when using a login already taken", async function () {
        const UNIQUE_CONSTRAINT_ERROR = "P2002";
        const _CLIENT_VERSION = "6.8.2" // not relevant
        prisma_mock.user.create.mockRejectedValue(
            new PrismaClientKnownRequestError(
                faker.lorem.words({ min: 10, max: 50 }),
                {
                    code: UNIQUE_CONSTRAINT_ERROR,
                    clientVersion: _CLIENT_VERSION,
                }
            ),
        );
        
        const request_body = {
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
            password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(403);
            
        const response_body = response.body;
        expect(response_body).toHaveProperty("error", "UniqueConstraintError");
        expect(response_body).toHaveProperty("message", `Login ${request_body.login} is already registered`);
    });

    it("should not register when prisma throw an error different of P2002 (Unique Constraint Error)", async function () {
        const RAW_QUERY_FAILED = "P2010";
        const _CLIENT_VERSION = "6.8.2" // not relevant
        prisma_mock.user.create.mockRejectedValue(
            new PrismaClientKnownRequestError(
                faker.lorem.words({ min: 10, max: 50 }),
                {
                    code: RAW_QUERY_FAILED,
                    clientVersion: _CLIENT_VERSION,
                }
            ),
        );
        
        const request_body = {
            login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
            password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
        };
        const response = await request(app)
            .post(SIGNUP_ENDPOINT)
            .send(request_body)
            .expect(500);
            
        const response_body = response.body;
        expect(response_body).toHaveProperty("error", "Internal Server Error");
        expect(response_body).toHaveProperty("message", "Ops... Something went wrong!");
    });

    describe("invalid login", function () {
        it("should not register a user with a numeric type login", async function () {
            const request_body = {
                login: faker.number.int({ min: 10_000_000, max: 999_999_999 }),
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must be a string value");
        });

        it("should not register a user with a null login", async function () {
            const request_body = {
                login: null,
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must be a string value");
        });
        
        it("should not register a user with a undefined login", async function () {
            const request_body = {
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must be a string value");
        });

        it("should not register a user with a login using invalid characters", async function () {
            const request_body = {
                login: "valid.login.until.$",
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must have only valid characters [0-9a-zA-Z._-]");
        });
        
        it(`should not register a user with a login less than ${MIN_LOGIN_LENGTH} characters`, async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, MIN_LOGIN_LENGTH - 1),
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must have between 5 and 100 characters (both included)");
        });
        
        it(`should not register a user with a login more than ${MAX_LOGIN_LENGTH} characters`, async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, MAX_LOGIN_LENGTH + 1),
                password: faker.string.sample({ min: MIN_PASSWORD_LENGTH, max: 1_000 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Login must have between 5 and 100 characters (both included)");
        });
    });
    
    describe("invalid password", function () {
        it("should not register a user with a numeric type password", async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
                password: faker.number.int({ min: 10_000_000, max: 999_999_999 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Password must be a string value");
        });

        it("should not register a user with a null password", async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
                password: null,
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Password must be a string value");
        });
        
        it("should not register a user with a undefined password", async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Password must be a string value");
        });
        
        it(`should not register a user with a password less than ${MIN_PASSWORD_LENGTH}`, async function () {
            const request_body = {
                login: faker.string.fromCharacters(VALID_LOGIN_CHARACTERS, { min: MIN_LOGIN_LENGTH, max: MAX_LOGIN_LENGTH }),
                password: faker.internet.password({ length: MIN_PASSWORD_LENGTH - 1 }),
            };
            const response = await request(app)
                .post(SIGNUP_ENDPOINT)
                .send(request_body)
                .expect(400);
                
            const response_body = response.body;
            expect(response_body).toHaveProperty("error", "ValidationError");
            expect(response_body).toHaveProperty("message", "Password must have at least 8 characters");
        });
    });
});
