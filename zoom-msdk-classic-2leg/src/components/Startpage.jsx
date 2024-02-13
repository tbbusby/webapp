import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import * as EmailValidator from 'email-validator';


const StartPage = () => {
  
  const navigate = useNavigate();
  const [name, setName] = useState('Ticorrian');
  const [meetingId, setMeetingId] = useState('8951830966');
  const [password, setMeetingPwd] = useState('753494');
  const [email, setEmail] = useState('ticorrianheardsandbox@gmail.com');
  const [role, setRole] = useState('0');
  const [sdkKey, setSdkKey] = useState('');
  const [zak, setZak] = useState('');
  const [loader, setLoader] = useState(false);
  const [loader2leg, setLoader2leg] = useState(false);
  const [complete2leg, setcomplete2leg] = useState(false);
  const [loader3leg, setLoader3leg] = useState(false);
  const [complete3leg, setcomplete3leg] = useState(false);
  const [disable, setDisable] = useState(false);

  const change = (e) => {
    switch(e.target.id) {
        case "userName":
            setName(name => e.target.value);
            console.log(name)
            break;
        case "meetingId":
            setMeetingId(meetingId => e.target.value);
            break;
        case "meetingPwd":
            setMeetingPwd(password => e.target.value);
            break;
        case "email":
            setEmail(email => e.target.value);
            break;
    }
  };

  const getSDKKEY = async () => {
    const settings = {
      mode: "cors",
      cache: "no-cache",
      headers: {
        'Content-Type':'text/plain',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'}
    };

    await fetch("https://zoom-auth-server-20be414301cf.herokuapp.com/key", settings).then( async res => {
     await res.text().then( key => {
       console.log("SDK KEY", key);
       if (key) {
        Toastify({
          text: "SDK Key Retrieved",
          duration: 3000,
          gravity: "bottom", 
          position: "left", 
        }).showToast();
        setSdkKey(key);
       } else {
        Toastify({
          text: "Error getting SDK Key",
          duration: 3000,
          gravity: "bottom", 
          position: "left", 
        }).showToast(); 
       }
      }); 
    });
  };

  const get3legZak = async () => {

    let state = btoa(name+':'+meetingId+":"+password+":"+email);

    const settings = {
      mode: "cors",
      cache: "no-cache",
      headers: {
        'Content-Type':'text/plain',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'}
    };

    await fetch("https://zoom-auth-server-20be414301cf.herokuapp.com/oauth?state=" + state, settings).then( async res => {
      await res.text().then( url => {
        console.log("URL", url);
        if (url) {
          window.location.href = url;
        } else {
         Toastify({
           text: "Error from /OAuth",
           duration: 3000,
           gravity: "bottom", 
           position: "left", 
         }).showToast(); 
        }
       }); 
     });
  };

  const get2legZak = async () => {

    setLoader2leg(true);

    if (!EmailValidator.validate(email)) {
    
      (email === '') 
      ? Toastify({
        text: "Email Required for 2-Legged OAuth",
        duration: 3000,
        gravity: "bottom", 
        position: "left", 
      }).showToast()  
      
      : Toastify({
        text: "Invalid Email Format",
        duration: 3000,
        gravity: "bottom", 
        position: "left", 
      }).showToast();

      setEmail(email => '');
      setLoader2leg(false);

      return;
    } 

    await fetch("https://zoom-auth-server-20be414301cf.herokuapp.com/2LegOauth", {
      method: 'POST', 
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: email})
    }).then(res => {
      if (res.status === 200) {
        Toastify({
          text: "Access Token Retrieved",
          duration: 3000,
          gravity: "bottom", 
          position: "left", 
          }).showToast();
      } else {
        Toastify({
          text: "Error getting Access Token",
          duration: 3000,
          gravity: "bottom",
          position: "left",
          }).showToast();
          setLoader2leg(false);
      }
    }).catch(err => console.log(err));
  
    await fetch("https://zoom-auth-server-20be414301cf.herokuapp.com/getZak?email=" + email).then( async res => {
      await res.json().then(data => {
        console.log("ZAK",data.zak);
        setZak(zak => data.zak);
  
        if (data.zak) {
          Toastify({
            text: "Zak token retrieved",
            duration: 3000,
            gravity: "bottom", 
            position: "left", 
            }).showToast();
            setcomplete2leg(true);
        } else {
          Toastify({
            text: "Error getting Zak",
            duration: 3000,
            gravity: "bottom",
            position: "left",
            }).showToast();
        }
        setLoader2leg(false);
      });
    }).catch( err => console.log(err) );
  };

  const joinSession = async () => {

    if (name === "" || meetingId === "") { 
      Toastify({
        text: "Name and Meeting ID Required",
        duration: 3000,
        gravity: "bottom", 
        position: "left", 
      }).showToast();
      return;
    }
    setDisable(disable => !disable);
    setLoader(loader => !loader);

    let MeetingConfig = {};

    let settings = {
      mode: "cors",
      method: 'GET',
      headers: {
        "Content-Type": "text/plain"
      }
    };

    await fetch("https://zoom-auth-server-20be414301cf.herokuapp.com/signature?meetingNumber=" + meetingId + "&role=" + role, settings).then( async (res) => {
        await res.text().then( async (data) => {
          console.log(data);
          if (data) {
            MeetingConfig.meetingSDKJWT = data.toString().trim();
            MeetingConfig.meetingSDKKEY = sdkKey;
            MeetingConfig.meetingSDKZAK = zak;
            MeetingConfig.userName = name;
            MeetingConfig.meetingId = meetingId;
            MeetingConfig.meetingPwd = password;

            console.log({MeetingConfig});
          } else {
            console.log(data);
          }
        });
       });
    
    setLoader(loader => !loader);
    navigate("/meetingspage", {state: MeetingConfig});
  };

  useEffect(() => {
    const zoomMeetingSDK = document.getElementById("zmmtg-root");
    zoomMeetingSDK.style.display = 'none';
    getSDKKEY();
  }, []);

  useEffect(() => {
    let url = (new URL(window.location.href)).searchParams;
    console.log("URL",url);
    if (url.has("zak")) setZak( url.get("zak") );
    if (url.has("state")) {
      let arr = atob(url.get("state")).split(":");
      console.log(arr)
      setName(arr[0]);
      setMeetingId(arr[1]);
      setMeetingPwd(arr[2]);
      setEmail(arr[3]);
    }
  }, []);

  return (
    <React.Fragment>
      <div className="flex flex-col items-center w-96 mt-56 m-auto">
      <h1 className="text-3xl">Meeting SDK - Classic</h1>
      <input className="h-12 px-2 text-xl border-2 border-solid rounded-lg mt-2 border-sky-600 hover:border-sky-700 w-1/2" type="text" placeholder=" User Name"  value={name} id="userName" onChange={change}/>
      <input className="h-12 px-2 text-xl border-2 border-solid rounded-lg mt-2 border-sky-600 hover:border-sky-700 w-1/2" type="text" placeholder=" Meeting ID"  value={meetingId} id="meetingId" onChange={change}/>
      <input className="h-12 px-2 text-xl border-2 border-solid rounded-lg mt-2 border-sky-600 hover:border-sky-700 w-1/2" type="text" placeholder=" Password"  value={password} id="meetingPwd" onChange={change}/>
      <input className="h-12 px-2 text-xl border-2 border-solid rounded-lg mt-2 border-sky-600 hover:border-sky-700 w-1/2" type="text" placeholder=" Email" value={email}  id="email" onChange={change}/>
      <div style={ {display: "flex", width: "47%", justifyContent: "space-between"} }>
         <div>
          <input type="radio" id="host" name="role" value="1" onChange={e=>setRole(e.target.value)}/>
          <label htmlFor="html">Host</label>
         </div>
         <div>
           <input type="radio" id="participant" name="role" value="0" onChange={e=>setRole(e.target.value)} checked/>
           <label htmlFor="css">Participant</label>
         </div>
      </div>
      <div style={ {display: "flex", width: "47%", justifyContent: "space-between"} }>
         <button className="items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                 type="button" 
                 onClick={get2legZak}
                 disabled={loader2leg || loader3leg || complete2leg || complete3leg}>
            {loader2leg ? <BallTriangle height={25} width={100} radius={5} color="white" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/> : (complete2leg) ? 'Success': '2Leg'}
         </button>
         <button className="items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" 
                 type="button" 
                 onClick={get3legZak}
                 disabled={loader2leg || loader2leg || complete2leg || complete3leg}>
            {loader3leg ? <BallTriangle height={25} width={100} radius={5} color="white" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/> : (complete3leg) ? 'Success' : '3Leg'}
         </button>
        </div>
      <button className="flex items-center justify-center h-12 border-solid rounded-lg mt-2 bg-sky-600 w-1/2 text-white hover:bg-sky-700 active:bg-sky-800" type="button" disabled={disable} onClick={joinSession}>
        {loader ? <BallTriangle height={25} width={100} radius={5} color="white" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/> : 'Join Session'} 
        </button>
      </div>
    </React.Fragment>
  );
};

export default StartPage;
