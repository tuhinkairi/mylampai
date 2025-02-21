import { auth } from "./authlib";
export default async function getUserFromAuth() {
    const user = await auth();
    if (!user) {
        return null;
    }
    return user;
}