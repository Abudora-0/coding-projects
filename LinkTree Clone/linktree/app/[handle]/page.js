
import React from 'react'
import Link from 'next/link'
import clientPromise from '@/lib/mongodb'
import { notFound } from 'next/navigation'


export default async function Page({ params }) {

   
    const handle = (await params).handle
    const client = await clientPromise;
    const db  = client.db("linktree")
    const collection = db.collection("links")


    const item = await collection.findOne({handle: handle})
    if(!item){
        return notFound()
    }

    console.log(item)


 
    

    return <div className='flex min-h-screen bg-gradient-to-r from-[#000066] to-[#ff99cc]  justify-center items-start py-10'>
        {item && <div className='photo flex justify-center flex-col items-center gap-2'>
            <img src={item.pic} alt='pic' className="border-4 rounded-full"/>
            <span className='font-bold text-2xl text-white'>@{item.handle}</span>
            <span className='desc text-center w-80 text-lg text-white'>{item.desc}</span>
            <div className='links'>
                {item.links.map((item,index)=>{
                    return <Link key={index} target='_blank' href={item.link}><div className='bg-purple-100 font-semibold py-4 shadow-lg px-2 min-w-96 flex justify-center rounded-md my-3'>
                        {item.linktext}
                        </div></Link>
                })}
            </div>
    </div>}
</div>
}
