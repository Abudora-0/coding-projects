import Image from "next/image";
import localFont from "next/font/local";
import Link from "next/link";


const poppins = localFont({
  src: './fonts/Poppins-ExtraBold.ttf',
  variable: "--font-poppins",
  weight: "100 900",
});


export default function Home() {
  return (
    <main className="bg-yellow-200 min-h-[89.5vh]">
      <section className="grid grid-cols-2 h-[50vh]">
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className={`text-3xl font-bold my-2 text-white ${poppins.className}`}>
            The Only URL Shortener you will ever need
          </p>
          <p className="px-50 text-lg text-white text-center my-2">
            Here at Delinks we won't ask for any of the things other sites ask like login or subscription.Our goal is only to provide you with our assitance.
          </p>
          <div className="flex gap-3 justify-start">
            <Link href="/shorten"><button className='bg-yellow-500 my-2 text-white rounded-lg shadow-lg p-3 py-1 font-bold'>Try Now</button></Link>
            <Link href="/github"><button className='bg-yellow-500 my-2 text-white rounded-lg shadow-lg p-3 py-1 font-bold'>GitHub</button></Link>
          </div>
        </div>
        <div className="flex justify-start relative">
          <Image className="mix-blend-darken" alt="an image of Vector" src={"/vector.jpg"} fill={true} />
        </div>
      </section>
    </main>
  );
}
