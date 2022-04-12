import * as speakeasy from 'speakeasy'
import * as QRCode from "qrcode"
import {GeneratedSecret} from "speakeasy";

const SECRET_NAME = 'net.azisaba.commander'
const ISSUER = 'AzisabaCommander'

/**
 * Generate a totp secret
 * @return GeneratedSecret
 */
export const generateSecret = () : GeneratedSecret => {
    return  speakeasy.generateSecret({
        length: 20,
        name: SECRET_NAME,
        issuer: ISSUER
    })
}

/**
 * Generate a QRCode
 * @param secret
 * @return string
 */
export const generateQRCode = async (secret: GeneratedSecret): Promise<string> => {
    const url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: encodeURIComponent(SECRET_NAME),
        issuer: ISSUER
    })
    return await QRCode.toDataURL(url)
}

/**
 * Verify a token
 * @param secretBase64
 * @param token
 */
export const verifyToken = (secretBase64: string, token: string) : boolean => {
    return speakeasy.totp.verify({
        secret: secretBase64,
        encoding: 'base32',
        token: token
    });
}