import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false, 
    name: '',
    email: '',
    password: '',
    photo: ''

  })

const provider = new firebase.auth.GoogleAuthProvider();
var fbProvider = new firebase.auth.FacebookAuthProvider();
const handleSingIn = () => {
  firebase.auth().signInWithPopup(provider)
  .then (res => {
    const{displayName, photoUrl, email} = res.user;
    const signedInUser = {
      isSignedIn: true,
      name: displayName, 
      email: email,
      photo: photoUrl
    }
    setUser(signedInUser);
    console.log(displayName, photoUrl, email);
  })

  .catch(err =>{
    console.log(err);
    console.log(err.message);
  })
}

const handleFbLogin = () => {
  firebase.auth().signInWithPopup(fbProvider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}

const handleSingOut = () => {
  firebase.auth().signOut()
  .then(res => {
    const signedOutUser = {
      isSignedIn: false,
      name: '',
      photo: '',
      email: '',
      error: '',
      success: false
    } 
    setUser(signedOutUser);
  })
  .catch(err => {

  })
}

  const handleBlur = (e) => {
    let isFieldValid = true;

    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
     
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }

  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      // console.log('submitting');

      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
        // console.log(res);
      })
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        // var errorCode = error.code;
        // var errorMessage = error.message;
        //  console.log(errorCode, errorMessage);
        // ...
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log('sign in user info', res.user);
      })
      .catch(function(error) {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
    console.log('user name updated successfully!')
    }).catch(function(error) {
      console.log(error);
    });
  }
  return (
    <div className="App">

      {
        user.isSignedIn ? <button onClick={handleSingOut}> Sign out </button> :
         <button onClick={handleSingIn}> Sign in </button>
      } <br/>
      <button onClick={handleFbLogin}> Sign in using facebook </button>
      {
        user.isSignedIn && <div>
            <p> Welcome, {user.name} </p>
            <p>Email: {user.email}</p>
            <img src={user.photo} alt=""/>
        </div>
      }
      <h1> Our Authentication </h1>
      {/* <h2>Name: {user.name}</h2>
      <h2>Email: {user.email}</h2>
      <h2>Password : {user.password}</h2> */}

     
       <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser"/>
       <label htmlFor="newUser" >New User Sign up </label>
       <form onSubmit={handleSubmit}>
         {newUser && <input name="name" type="text"  onBlur={handleBlur} placeholder="Your Name"/>}
       <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email Address" required/>
        <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="Your Password" id="" required/>
        <br/>
       <input type="submit" value={newUser ? 'Sign up' : 'Sign in'}/>
     </form>
     <p style={{color: 'red'}}> {user.error}</p>
    {user.success &&   <p style={{color: 'green'}}> User {newUser ? 'Created' : 'Logged In' } Successfully! </p>}
    </div>
  );
}

export default App;
