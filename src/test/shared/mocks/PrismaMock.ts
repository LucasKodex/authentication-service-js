export class PrismaMock {
    user = {
        create: jest.fn()
            .mockName("create"),
    };
};

export default PrismaMock;
