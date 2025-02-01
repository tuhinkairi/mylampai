export default function transformKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
        const formattedKey: string = key
            .toLowerCase() // Convert to lowercase
            .replace(/\s+/g, ''); // Remove all spaces

        acc[formattedKey] = obj[key]; // Preserve the original value
        return acc;
    }, {} as Record<string, any>);
}