"use client"
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {


  const router = useRouter();
  const [text, settext] = useState("")

  const createTree = () => {
    router.push(`/generate?handle=${text}`)
  }

  return (
    <main>
      <section className="bg-[#254f1a] min-h-[100vh] grid grid-cols-2">
        <div className="flex justify-center  flex-col ml-[10vw] mt-[7vw] gap-3">
          <p className="text-[#d2e823] font-bold text-6xl">Everything you</p>
          <p className="text-[#d2e823] font-bold text-6xl">are. In one,</p>
          <p className="text-[#d2e823] font-bold text-6xl">simple link in bio.</p>
          <p className="text-[#d2e823] my-4 text-xl">Join 50M+ people using LinkTree for their link in bio. One link to help you share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.</p>
          <div className="input flex gap-2">
            <input value={text} onChange={(e) => settext(e.target.value)} className="px-2 py-2 focus:outline-lime-500 rounded-md" type="text" placeholder="Enter your Handle" />
            <button onClick={() => createTree()} className="bg-pink-200 rounded-full px-4 py-4 font-semibold">Claim your LinkTree</button>
          </div>
        </div>
        <div className="flex items-center justify-center flex-col mr-[10vw]">
          <img src="/home.png" alt="homepage img" className="mt-[5vw]" />
        </div>
      </section>

      <section className="bg-[#4c1a4c] min-h-[100vh] grid grid-cols-2">

        <div className="flex items-center justify-center flex-col ">
          <img src="/home2.png" alt="homepage img" />
        </div>

        <div className="flex justify-center flex-col mr-[10vw] gap-3">
          <p className="text-[#b686dc] font-bold text-5xl">Create and customize</p>
          <p className="text-[#b686dc] font-bold text-5xl">your Linktree in</p>
          <p className="text-[#b686dc] font-bold text-5xl">minutes</p>
          <p className="text-[#b686dc] my-4 text-md">Connect your TikTok, Instagram, Twitter, website, store, videos, music, podcast, events and more. It all comes together in a link in bio landing page designed to convert.</p>
          <div className="input flex gap-2">
            <button className="bg-[#401b5d] text-white rounded-full px-4 py-4 font-semibold">Get started for free</button>
          </div>
        </div>



      </section>

      <section className="bg-[#600012] min-h-[100vh] grid grid-cols-2">


        <div className="flex justify-center flex-col ml-[10vw] gap-3">
          <p className="text-[#e2ade2] font-bold text-5xl">Share your Linktree</p>
          <p className="text-[#e2ade2] font-bold text-5xl">from your Instagram,</p>
          <p className="text-[#e2ade2] font-bold text-5xl">TikTok, Twitter and</p>
          <p className="text-[#e2ade2] font-bold text-5xl">other bios</p>
          <p className="text-[#e2ade2] my-4 text-md">Add your unique Linktree URL to all the platforms and places you find your audience. Then use your QR code to drive your offline traffic online.</p>
          <div className="input flex gap-2">
            <button className="bg-[#4c1a4c] text-white rounded-full px-4 py-4 font-semibold">Get started for free</button>
          </div>
        </div>

        <div className="flex items-center justify-center flex-col ">
          <img src="/home3.png" alt="homepage img" />
        </div>


      </section>

      <section className="bg-[#1f2223] min-h-[100vh] grid grid-cols-2">

      <div className="flex items-center justify-center flex-col ">
          <img src="/home4.png" alt="homepage img" />
        </div>


        <div className="flex justify-center flex-col ml-[10vw] gap-3">
          <p className="text-[#cfcbc5] font-bold text-5xl">Analyze your</p>
          <p className="text-[#cfcbc5] font-bold text-5xl">audience and keep</p>
          <p className="text-[#cfcbc5] font-bold text-5xl">your followers</p>
          <p className="text-[#cfcbc5] font-bold text-5xl">engaged</p>
          <p className="text-[#cfcbc5] my-4 text-md">Track your engagement over time, monitor revenue and learn what’s converting your audience. Make informed updates on the fly to keep them coming back.</p>
          <div className="input flex gap-2">
            <button className="bg-[#4c1a4c] text-white rounded-full px-4 py-4 font-semibold">Get started for free</button>
          </div>
        </div>

        


      </section>
    </main>
  );
}
