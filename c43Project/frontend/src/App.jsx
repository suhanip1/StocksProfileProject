import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
function App() {
  const makeReq = async () => {
    axios.get("http://127.0.0.1:8000/test/").then((res) => console.log(res)).catch((error) => alert(error));
  }
  useEffect(() => {
    makeReq()
  },[])
  return (
    <>
    <div>HELLO</div>
    </>
  )
}

export default App
