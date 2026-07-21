"use client";

import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput(props: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${props.className ?? ""} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-xl active:scale-95"
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
