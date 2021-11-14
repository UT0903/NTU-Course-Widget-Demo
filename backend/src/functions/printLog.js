import fs from 'fs';
export default (msg) => {
    try{
        console.log(msg)
        fs.appendFileSync('log/syslog.txt', msg + '\n')
    }
    catch{
        console.log('error in fs', __dirname)
    }
}