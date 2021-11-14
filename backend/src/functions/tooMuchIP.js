const IPS = {}
const threshold = 100
const timeInteval = 1000*60*5
export default (ip) => {
    if(!IPS[ip]){
        IPS[ip] = [Date.now()]
        return false
    }
    else{
        //console.log(IPS)
        IPS[ip] = IPS[ip].filter((item)=> Date.now() - item < timeInteval)
        //console.log(IPS)
        if(IPS[ip].length > threshold){
            console.log('too much request from', ip)
            return true
        }
        else{
            IPS[ip].push(Date.now())
            return false
        }
        
    }
}