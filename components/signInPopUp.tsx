"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button'
import { signInWithGoogle } from '@/service/aujth.service'
  

const SignInPopUp = () => {

        const handleSignin = () =>{
            signInWithGoogle()
        }

  return (
    <div>
      <Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <Button size={"lg"} onClick={handleSignin}>Sign in with Google</Button>
  </DialogContent>
</Dialog>

    </div>
  )
}

export default SignInPopUp;
