"use client"
import React from 'react'
import { useState } from 'react'
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { redirect, useSearchParams } from 'next/navigation';



const Generate = () => {
    
    const searchParams = useSearchParams();

    const [links, setlinks] = useState([{link: "", linktext: ""}])
    const [handle, sethandle] = useState(searchParams.get("handle"))
    const [pic, setpic] = useState("")
    const [desc, setdesc] = useState("")


    const handleChange = (index, link,linktext) =>{
        setlinks((initialLinks)=>{
            return initialLinks.map((item, i)=>{
                if(i==index){
                    return{link, linktext}
                }
                else{
                    return item
                }
            })
        })
    }

    const addLink = ()=>{
        setlinks(links.concat([{link: "", linktext: ""}]))
    }

    const sumbitLinks = async ()=>{
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "links":links,
            "handle":handle,
            "pic":pic,
            "desc":desc
        });

        console.log(raw);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };


        const r = await fetch("http://localhost:3000/api/add", requestOptions);
        const result = await r.json();

        if(result.success){
            // toast.success(result.message)
            
            setlinks([])
            setpic("")
            sethandle("")
            setdesc("")
        }
        else{
            // toast.error(result.message)
        }
    }

  return (
    <div className='bg-[#E9C0E9] min-h-screen grid grid-cols-2'>
        <div className='col1 flex justify-center items-center ml-[10vw] mt-[8vw]  flex-col text-gray-800'>
            <div className='flex flex-col gap-5 my-8'>
                <h1 className='font-bold text-4xl'>Create your LinkTree</h1>


                <div className='item'>
                    <h2 className='font-semibold text-2xl'>Step 1: Claim your Handle</h2>
                    <div className=''>
                        <input value={handle || "" } onChange={e=>{sethandle(e.target.value)}}
                        className='px-4 py-2 my-2 focus:outline-purple-500 rounded-full'
                        type='text' placeholder='Chose a Handle'/>
                    </div>
                </div>

                <div className='item'>
                    <h2 className='font-semibold text-2xl'>Step 2: Add Links</h2>
                    {links && links.map((item, index)=>{
                       return <div key={index} className=''>
                        <input value={item.linktext|| "" } onChange={e=>{handleChange(index,item.link, e.target.value)}} className='px-4  py-2 my-2 focus:outline-purple-400 rounded-full' type='text' placeholder='Enter Link Text'/>
                        <input value={item.link|| "" } onChange={e=>{handleChange(index,e.target.value,item.linktext)}} className='px-4 py-2 my-2 mx-2 focus:outline-purple-400 rounded-full' type='text' placeholder='Enter Link'/>
                    </div>

                    })}
                    <button onClick={()=> addLink()} className='p-5 py-2  bg-[#502274] text-white font-bold rounded-3xl'>+Add Link</button>
                </div>

                <div className='item'>
                    <h2 className='font-semibold text-2xl'>Step 3: Add Picture and Description</h2>
                    <div className=' flex flex-col'>
                        <input value={pic || "" } onChange={e=>{setpic(e.target.value)}} className='px-4 py-2 my-2 focus:outline-purple-500 rounded-full' type='text' placeholder='Set a Picture'/>
                        <input value={desc || "" } onChange={e=>{setdesc(e.target.value)}} className='px-4 py-2 my-2 focus:outline-purple-500 rounded-full' type='text' placeholder='Set Description'/>
                        <button value={pic=="" || handle=="" || links[0].linktext==""  } onClick={()=> {sumbitLinks()}} className=' disabled:bg-purple-300 p-5 py-2  bg-[#502274] text-white font-bold rounded-3xl'>Create your LinkTree</button>
                    </div>

                </div>
            </div>
        </div>
        <div className='col2 w-full  h-screen bg-[#E9C0E9]'>
            <img src='/generate.png' alt='generate your links' className='h-screen ml-[10vw] object-fit'/>
            {/* <ToastContainer/> */}
        </div>
    </div>
   
  )
}

export default Generate