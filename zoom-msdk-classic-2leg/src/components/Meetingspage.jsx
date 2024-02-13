import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import { ZoomMtg } from '@zoomus/websdk';

const Meetingspage = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const [loader, setLoader] = useState(true);
   
   const joinMeeting = async ( {meetingSDKJWT, meetingSDKKEY, meetingSDKZAK, userName, meetingId, meetingPwd}) => {
      
      console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.17.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      ZoomMtg.i18n.load('en-US');
      ZoomMtg.i18n.reload('en-US');

      const zoomMeetingSDK = document.getElementById("zmmtg-root");
      zoomMeetingSDK.style.display = 'block';

      console.log({JWT: meetingSDKJWT});

      ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
        console.log({userJOINED: data});
        });

      ZoomMtg.inMeetingServiceListener('onUserUpdate', function (data) {
        console.log({userUPDATED: data});
        });

      ZoomMtg.init({
        //  leaveRedirect: false,
         leaveUrl: "http://localhost:3000/startpage",
         disablePreview: false,
         isSupportNonverbal: false,
         success: (success) => {
           console.log("SUCCESS", success)
           ZoomMtg.join({
             customerKey: "custkey1",
             signature: meetingSDKJWT, 
             sdkKey: meetingSDKKEY,
             zak: meetingSDKZAK, 
             meetingNumber: meetingId,
             userName: userName,
             passWord: meetingPwd,
             success: (success) => { 
               setLoader(loader => !loader);
               let el = document.querySelector("title");
               console.log("el", el);
               el.innerHTML = "JUST ANOTHER MEETING"
               ZoomMtg.setVirtualBackground({id: 'blur'});
              //  ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) { //when leaveRedirect: true
              //     console.log("Going back to startpage");
              //     zoomMeetingSDK.style.display = 'none';
              //     navigate("/startpage");
              //   });
             
             },
             error: (error) => { console.log(error) }
           })
        },
       error: (error) => {
         console.log(error)
       }
     });
   };

   useEffect(() => {
    if (location.state) {
       console.log({meetingspageConfig:location.state})
       joinMeeting(location.state);
    } else {
        console.error("No config object passed. Going back to /startpage")
        navigate("/startpage");
    }
     }, []);
   
     return (
       <React.Fragment>
         {loader && <div className="flex items-center w-48 m-auto mt-96">
            <BallTriangle  height={200} width={200} radius={5} color="#0096FF" ariaLabel="ball-triangle-loading" wrapperClass={{}} wrapperStyle="" visible={true}/>
            </div>}

       </React.Fragment>
     );
};

export default Meetingspage;
