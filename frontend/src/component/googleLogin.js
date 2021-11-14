import React, { useState, useEffect } from 'react';
import { gapi, loadAuth2, loadClientAuth2 } from 'gapi-script'
// eslint-disable-next-line import/no-anonymous-default-export
export default ({calendarObj, events, failedCallback, successCallback}) => {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
  const CLIENT_ID = "863727614400-ncmg6aoq5qkmme3nr5as964d7kon77iu.apps.googleusercontent.com"
  const API_KEY = "AIzaSyBq6JHLqHVm6sdfB-F-zxWINeZCF0hrmrw"
  const SCOPE = 'https://www.googleapis.com/auth/calendar'
  useEffect(() => {
    const setAuth2 = async () => {
        gapi.load("client:auth2", ()=>{
            gapi.auth2.init({client_id: CLIENT_ID})
        });
    }
    setAuth2();
  }, []);

  const login = () =>{
    const authParams = {
        'response_type' : 'permission', // Retrieves an access token only
        'client_id' : CLIENT_ID, // Client ID from Cloud Console
        'immediate' : false, // For the demo, force the auth window every time
       'scope' : ['profile', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events']  // Array of scopes
    };
    gapi.auth.authorize(authParams, (res)=>{
        gapi.client.setApiKey(API_KEY);
        gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
            .then(()=>{
                //
                const batch = gapi.client.newBatch();
                events.map((r, j) => {
                  batch.add(gapi.client.calendar.events.insert({
                      'calendarId': 'primary',
                      'resource': events[j]
                    }))
                })

                batch.then(() => {
                  console.log('all jobs now dynamically done!!!')
                });
            }, (err)=>{
                console.log('auth failed', err)
                failedCallback()
            })
    })
  }

  return (
    <div className="container">
      <button onClick={login}>
        Submit
      </button>
    </div>
  );
}
