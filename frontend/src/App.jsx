import "./App.css";
import { SignedOut, SignedIn, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";

function App(){

  return (
    <>
      <h1>Welcome to the app</h1>

      <SignedOut>
        <SignInButton mode="modal">
          <button>Log In</button>
        </SignInButton>
        
      </SignedOut>

      <SignedIn>
        <SignOutButton />
        <UserButton />
      </SignedIn>
    </>
  );
}

export default App;
