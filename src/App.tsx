import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import ReactWebChat, {
  createDirectLine,
  createStore,
} from "botframework-webchat";

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [token, setToken] = useState("");
  const userId = "dl_" + Math.floor(Math.random() * 1_000_000_000);
  const headers = {
    Authorization: `Bearer ${process.env.REACT_APP_BOT_SERVICE_KEY ?? ""}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetch("https://directline.botframework.com/v3/directline/conversations", {
      body: JSON.stringify({ User: { Id: userId } }),
      method: "POST",
      headers,
    })
      .then((response) => response.json())
      .then((data) => {
        setToken(data.token);
      });
  }, []);

  const store = useMemo(
    () =>
      createStore(
        {},
        ({ dispatch }: { dispatch: any }) =>
          (next: any) =>
          (action: any) => {
            if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
              dispatch({
                type: "WEB_CHAT/SEND_EVENT",
                payload: {
                  name: "webchat/join",
                  value: {
                    language: window.navigator.language,
                  },
                },
              });
            }
            return next(action);
          }
      ),
    []
  );

  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  return (
    <div>
      <button onClick={() => setShowChat(!showChat)}>Toggle WebChat</button>
      {showChat && (
        <ReactWebChat directLine={directLine} userID="" store={store} />
      )}
    </div>
  );
}
