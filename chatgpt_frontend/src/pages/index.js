import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // redirect to /login
  }, [router]);

  return (
      <>
        <Head>
          <title>Chat App - Login</title>
          <meta name="description" content="Chat Application - Login Page" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/* Δεν χρειάζεται να εμφανίζουμε κάτι */}
      </>
  );
}
