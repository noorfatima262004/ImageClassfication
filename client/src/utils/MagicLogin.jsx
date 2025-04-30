// MagicLogin.jsx
import React, { useState } from "react";

function MagicLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const requestMagicLink = async () => {
    try {
      const response = await fetch("http://localhost:5000/generate-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
  
      if (!response.ok) {
        throw new Error("Failed to send magic link");
      }
  
      setSent(true);
    } catch (err) {
      console.error("Error sending magic link:", err);
    }
  };
  

  return (
    <div className="p-4">
      <h2 className="text-xl">SafarSavvy Magic Login</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={requestMagicLink}>Send Login Link</button>
      {sent && <p>Check your email!</p>}
    </div>
  );
}

export default MagicLogin;
