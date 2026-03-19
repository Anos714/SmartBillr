import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

const App = () => {
  return (
    <div className="bg-red-500">
      <header>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </div>
  );
};
export default App;
