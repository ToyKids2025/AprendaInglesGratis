/**
 * CONFIGURATION - AprendaInglesGratis
 *
 * Centralized configuration for all environment variables and integrations
 *
 * @module Config
 * @version 1.0.0
 */
interface Config {
    env: string;
    port: number;
    appUrl: string;
    frontendUrl: string;
    databaseUrl: string;
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        tls: boolean;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    openai: {
        apiKey: string;
        model: string;
        whisperModel: string;
    };
    stripe: {
        secretKey: string;
        publishableKey: string;
        webhookSecret: string;
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        s3Bucket: string;
        cloudfrontDomain?: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    sms?: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    video?: {
        apiKey: string;
    };
    sentry?: {
        dsn: string;
    };
    rateLimit: {
        auth: number;
        api: number;
        uploads: number;
    };
    cors: {
        origins: string[];
    };
    logLevel: string;
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map