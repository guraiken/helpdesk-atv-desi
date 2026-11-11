const revokedTokens = new Map();

function removeExpired() {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, expiration] of revokedTokens) {
        if (expiration <= now) {
            revokedTokens.delete(jti);
        }
    }
}

export function revokeToken(jti, expiration) {
    removeExpired();
    revokedTokens.set(jti, expiration);
}

export function isTokenRevoked(jti) {
    removeExpired();
    return revokedTokens.has(jti);
}
