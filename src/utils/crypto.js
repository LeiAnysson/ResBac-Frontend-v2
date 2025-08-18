import CryptoJS from 'crypto-js';

const secretKeys = [
    process.env.REACT_APP_CRYPTOJS_SECRET_KEY_1,
    process.env.REACT_APP_CRYPTOJS_SECRET_KEY_2,
    process.env.REACT_APP_CRYPTOJS_SECRET_KEY_3
];

export function getRandomSecretKey() {
    const index = Math.floor(Math.random() * secretKeys.length);
    const keyValue = secretKeys[index];
    const parsedKey = CryptoJS.enc.Utf8.parse(keyValue);

    return {
        keyIndex: (index + 1).toString(),
        parsedKey
    };
}

export function encryptPasswordData(password) {
    const { keyIndex, parsedKey } = getRandomSecretKey();
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(password, parsedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const encryptedPassword = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);

    return { encryptedPassword, secretKeyName: keyIndex };
}

export function decryptLaravelEncryptedData(encryptedDataWithPrefix) {
    try {
        const keyIndex = parseInt(encryptedDataWithPrefix.charAt(0), 10) - 1;
        if (isNaN(keyIndex) || keyIndex < 0 || keyIndex >= secretKeys.length) {
            throw new Error('Invalid key index');
        }

        const key = CryptoJS.enc.Utf8.parse(secretKeys[keyIndex]);
        const base64Data = encryptedDataWithPrefix.slice(1);

        const encryptedWordArray = CryptoJS.enc.Base64.parse(base64Data);

        const iv = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(0, 4), 16);
        const ciphertext = CryptoJS.lib.WordArray.create(
            encryptedWordArray.words.slice(4),
            encryptedWordArray.sigBytes - 16
        );

        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}
