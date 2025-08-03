
export class JwtMock {
    sign = jest.fn()
        .mockName("sign");
}

export default JwtMock;
