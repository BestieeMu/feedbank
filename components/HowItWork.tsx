import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { signInWithGoogle } from "@/service/aujth.service";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const HowItWork = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      signInWithGoogle(router);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <section className="py-5 px-4 w-full overflow-hidden ">
      <div className=" px-4  sm:px-6  lg:px-8 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center -mx-5">
            <div className="w-full lg:w-1/2 px-5 mb-20 lg:mb-0">
              <div className="max-w-md">
                <span className="text-lg font-bold text-gray-500">
                  Start Collecting Feedback
                </span>
                <h2 className="mt-12 mb-10 text-[2rem] font-extrabold leading-tight text-gray-800 ">
                  Launch Your Project in Minutes
                </h2>
                <p className="mb-16 text-lg text-gray-600 dark:text-gray-400">
                  Create your project, share the link, and gather valuable
                  feedback seamlessly.
                </p>
                <Button
                  size={"lg"}
                  onClick={handleGetStarted}
                  className="uppercase text-white font-bold rounded-md"
                >
                  Get Started
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 px-5">
              <ul>
                <li className="flex pb-10 mb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="mr-8">
                    <span className="flex justify-center items-center w-14 h-14 bg-gray-200 text-lg font-bold rounded-full text-black ">
                      1
                    </span>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                      Create Your Account
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Sign up to access powerful feedback collection and
                      visualization tools.
                    </p>
                  </div>
                </li>
                <li className="flex pb-10 mb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="mr-8">
                    <span className="flex justify-center items-center w-14 h-14 bg-gray-200 text-lg font-bold rounded-full text-black ">
                      2
                    </span>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                      Set Up Your Project
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Define your project and customize feedback questions to
                      fit your needs.
                    </p>
                  </div>
                </li>
                <li className="flex pb-10 mb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="mr-8">
                    <span className="flex justify-center items-center w-14 h-14 bg-gray-200 text-lg font-bold rounded-full text-black ">
                      3
                    </span>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                      Share the Feedback Link
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Distribute your unique link to collect insights from users
                      and stakeholders.
                    </p>
                  </div>
                </li>
                <li className="flex pb-10 border-b border-gray-200 dark:border-gray-700">
                  <div className="mr-8">
                    <span className="flex justify-center items-center w-14 h-14 bg-gray-200 text-lg font-bold rounded-full text-black ">
                      4
                    </span>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                      Visualize & Analyze Feedback
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      Use an intuitive dashboard to track and interpret user
                      feedback effectively.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWork;
