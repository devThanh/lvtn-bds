import bcrypt from 'bcrypt';
import crypto from 'crypto'


const saltRounds = 10;
export default{
    encode: async(password: string)=>{
        const encodePassword = await bcrypt.hash(password, saltRounds)
        return encodePassword
    },

    decode: async(password: string, passwordUser: string)=>{
        const decodePassword = bcrypt.compareSync(password, passwordUser);
        return decodePassword
    },

    generateFileName: async(bytes = 32)=>{
        return crypto.randomBytes(bytes).toString('hex')
    }
}