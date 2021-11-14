export default (acc, pwd) =>{
    if(acc === 'b07902000' && pwd === 'guestUserPwd'){
        console.log('convert')
        return {accC: 'blablabla', pwdC: 'blablabla'}
    }
    else{
        
        return {accC: acc, pwdC: pwd}
    }
}
