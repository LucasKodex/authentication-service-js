export class RedisMock {
    set = jest.fn()
        .mockName("set");
};

export default RedisMock;
