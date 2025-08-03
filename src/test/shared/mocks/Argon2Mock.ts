export class Argon2Mock {
    hash = jest.fn()
        .mockName("hash");
}

export default Argon2Mock;
