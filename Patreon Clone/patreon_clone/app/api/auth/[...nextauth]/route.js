import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github"
import mongoose from "mongoose";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Payment from "@/models/Payment";


export const authoptions = NextAuth({
    providers:[

        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),
    ],
    callbacks:{
        async signIn({user, account, profile, email, credentials}) {
            if(account.provider == "github"){
                await connectDb()

                const currentUser = await User.findOne({email: email})
                if(!currentUser){
                    const NewUser = await User.create({
                        email : user.email,
                        username: user.email.split("@")[0],
                    })
                }
                return true
            }
            
        },

        async session({session, user, token}) {
            const dbUser = await User.findOne({email : session.user.email})
            session.user.name = dbUser.username
            return session
        },
    }
})

export { authoptions as GET , authoptions as POST}