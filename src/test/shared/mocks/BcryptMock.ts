export class BcryptMock {
    hash = jest.fn()
        .mockName("hash");
}

export default BcryptMock;
