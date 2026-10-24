import "./index.css";
import { useState } from "react"
export default function Register(){
const[Form,setForm]=useState({
    name:'',
    email:'',
    password:'',
    confirmPassword:''
});
const[show,setShowForm]=useState(true);
const handleFormSubmit=(e)=>{
e.preventDefault();
if (Form !== null && Form.password === Form.confirmPassword) {
   alert("you sucessfully registered");
   console.log(Form);
}
else{
alert("your password did not match");
}

}
const handleChange=(e)=>{

setForm({...Form,[e.target.id]: e.target.value});

}


return(
<>
<div className="register" onMouseEnter={()=>setShowForm(true)} onMouseLeave={()=>setShowForm(false)}>
     <button 
        ><span>Welcome</span><br /><span>Register/SignIN</span></button>
   
   {show &&
   <form action="" onSubmit={handleFormSubmit}>
   
    <label htmlFor="name">Name</label>
    <input type="text" id="name" value={Form.name} onChange={handleChange} />
    <label htmlFor="email">Email</label>
    <input type="email"  id="email" value={Form.email} onChange={handleChange}/>
    <label htmlFor="password">Password</label>
    <input type="password" id="password" value={Form.password} onChange={handleChange}/>
    <label htmlFor="confirmPassword">Confirm Password</label>
    <input type="password" id="confirmPassword" value={Form.confirmPassword} onChange={handleChange} />
     <button id="submit-btn" type="submit">Submit</button>
   </form>}
</div>
</>
)
}