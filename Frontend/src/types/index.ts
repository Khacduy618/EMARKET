export * from './user.interface';
export * from './product.interface';
export * from './cartItem.interface';
export * from './cart.interface';
export * from './address.interface';
export * from './shop.interface';
export * from './attributeValue.interface';
export * from './voucher.interface';
export * from './auth.interface';
export * from './order.interface';
export * from './adminUser.interface';
export * from './review.interface';
export * from './shop-ui.interface';
export * from './statistics.interface';

export function formatError(error: any): string {
    if (error.name === 'ZodError') {
        // Handle Zod validation errors 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldErrors = error.errors.map((err: any) => err.message);
        return fieldErrors.join('. ');
    } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
        // Handle Prisma unique constraint violation errors
        const field = error.meta?.target ? error.meta.target[0] : 'Field';
        return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2025') {
        // Handle Prisma "Record not found" errors
        const cause = error.meta?.cause || 'Record';
        return `${cause.charAt(0).toUpperCase() + cause.slice(1)} not found`;
    } else if (error.name === 'PrismaClientInitializationError') {
        // Handle Prisma database connection errors
        return 'Database connection failed. Please check your database configuration.';
    } else if (error.isAxiosError) {
        // Handle Axios HTTP request errors
        return `HTTP Request Failed: ${error.response?.data?.message || error.message}`;
    } else if (error instanceof Error) {
        // Handle generic JavaScript/TypeScript errors
        return error.message;
    } else {
        // Handle unknown errors
        return typeof error.message === 'string'
            ? error.message
            : JSON.stringify(error);
    }
    
}

