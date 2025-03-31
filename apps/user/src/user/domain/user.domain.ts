export class UserDomain {
    id: string;
    email: string;
    age: number;
    name: string;
    profile: string;
    password: string;
    cretedAt: Date;
    udpatedAt: Date;
    version: number;

    constructor(
        params: Pick<
            UserDomain,
            'email' | 'password' | 'name' | 'age' | 'profile'
        >,
    ) {
        this.email = params.email;
        this.name = params.name;
        this.password = params.password;
        this.age = params.age;
        this.profile = params.profile;
    }

    setId(id: string) {
        this.id = id;
    }

    setPassword(password: string) {
        this.password = password;
    }
}
