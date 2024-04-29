import React, { useEffect, useState } from 'react'
import './UserInGymSettings.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from "../../../assets/user.png"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
function UserInGymSettings() {
  const {gymid} = useParams();
  const [userInGym, setUserInGym] = useState(null);
  const [indexUserInArr,setIndexUserInArr] = useState(null);
  const [onTheme, setOnTheme] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchText ,setSearchText] = useState(null);
  const [filterArray, setFillterArray] = useState([]);


  const state = useSelector((state)=>{
    return{
    userId : state.auth.userId,
    token : state.auth.token,
    theme : state.auth.theme
    }
  })

  const config = {
    headers: { Authorization: `Bearer ${state.token}` }
  }
  useEffect(()=>{
    axios.get(`https://meraki-academy-project-5-qxxn.onrender.com/gyms/${gymid}/user`, config).then((result) => {
      setUserInGym(result.data.users);
      setFillterArray(result.data.users);
    }).catch((err) => {
      console.log(err);
    });
  },[]);
  useEffect(()=>{
    if(state.theme === "female"){
      setOnTheme(true);
    }else{
      setOnTheme(false);
    }
  },[state.theme]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


   const viewUserInList = ()=>{
    const userArray = [];
    for(let i = 0; i < filterArray?.length; i++){
      const endDate = new Date(filterArray[i].endsub);
      const now = new Date();
      const difference = endDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      userArray.push(
        <>
        <div style={{display:"flex", justifyContent:"space-between", placeItems:"center", width:"100%",padding:"10px"}}>
          <div style={{display:"flex", placeItems:"center", gap:"5px"}}>
            <h6 style={{paddingRight:"10px"}}>{i+1}</h6>
            <img style={{width:"52px", height:"52px", borderRadius:"32px"}} src={filterArray[i].image?filterArray[i].image:logo}/>
              
              <h5>{filterArray[i].firstname} ({filterArray[i].name_plan})</h5>
          </div>
          <div>
            <span style={{color:"rgb(130,130,130,0.8)"}}>End After {days} Days</span>
          </div>
          <div>
            <button className='btn-user' style={!onTheme ? {backgroundColor:"#A1E553"} : {backgroundColor:"#E333E5"}} onClick={()=>{
              setIndexUserInArr(i);
              handleShow()
            }}>Up to Coach</button>
          </div>
        </div>
        {i+1 < 50 ? <div style={{padding:"0 10px 0 10px", width:"100%",borderBottom:"1px solid #404040"}}></div> : <></>}
        
        </>
      )
    }
    return userArray;
   }
   
   const resultSearch = (e)=>{
      setSearchText(e);

      const filtered = userInGym.filter(user =>{
        const fullName = user.firstname+" "+user.lastname;
        return(
          user.firstname.toLowerCase().includes(e.toLowerCase()) ||
          user.lastname.toLowerCase().includes(e.toLowerCase()) || 
          fullName.toLowerCase().includes(e.toLowerCase())
        )
      }
      
     
    );
      setFillterArray(filtered);
    };

   const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };

  return (
    
      <div style={{display:"flex", justifyContent:"center", flexDirection:"column", width:"100%",placeItems:"center",padding:"10px"}}>
         <div className='member-in-gym-settings'>
                <p>{viewUserInList().length}{!searchText ? "/50" : ""} User</p>
          </div>
          <input style={{width:"50%", padding:"5px", borderRadius:"4px", border:"0", color:"white", backgroundColor:"#404040"}} placeholder='Search...' onChange={(e)=>{
            resultSearch(e.target.value)
          }}/>
          {errorMessage && <div style={{ color: "red" , padding:"10px"}}><span style={{ color: "white"}} >Error: </span>{errorMessage}</div>}
          
        <div style={{width:"100%", height:"80vh", overflowY:"scroll"}}>
          {viewUserInList()}
        </div>
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Role  {userInGym && userInGym[indexUserInArr]?.firstname} To Coach</Modal.Title>
        </Modal.Header>
        <Modal.Body>you are sure? please choose the plan</Modal.Body>
        <Modal.Footer>
          
          <Button style={{backgroundColor:"#101010", color:"white",fontWeight:"bold", border:"0"}} onClick={handleClose}>
            No
          </Button>
          <Button style={{backgroundColor:"#A1E533", color:"#101010",fontWeight:"bold",border:"0"}} onClick={()=>{
            axios.post(`https://meraki-academy-project-5-qxxn.onrender.com/gyms/gym/coach`, {gymId : gymid, coachId : userInGym[indexUserInArr].user_id}, config).then((result) => {
              userInGym.splice(indexUserInArr, 1);
              handleClose()
            }).catch((err) => {
              handleClose()
              console.log(err);
              if(err.response.status === 405){
                showError(err.response.data.message);
              }
            });
          }}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      </div>
  )
}

export default UserInGymSettings
