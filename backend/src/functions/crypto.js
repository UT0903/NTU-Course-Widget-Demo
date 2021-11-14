const encrypt_num = 20
const encrypt = (decrypted) => {
    let encrypted = ""
    for(let i = 0; i < decrypted.length; i++){
        encrypted += String.fromCharCode(decrypted.charCodeAt(i) + encrypt_num + i)
    }

    return encrypted
}

const decrypt = (encrypted) => {
    let decrypted = ""
    for(let i = 0; i < decrypted.length; i++){
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) - encrypt_num - i)
    }
    return decrypted
}
export {encrypt, decrypt}