import React, { useEffect, useState } from "react";

import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";

// import { mount as app1Mount } from "app1/bootloader";
const App1 = React.lazy(() => import("./remotes/App1"));
const App2 = React.lazy(() => import("app2/app2"));
const App3 = React.lazy(() => import("app3/App"));

import { getTasks } from "../service/tasks";

export default function Tasks(props) {
  const { instance, accounts, inProgress } = useMsal();

  const [tasks, setTasks] = useState([
    {
      id: "app1",
      title: "App 1",
      background: "#fff1ef",
      icon: undefined,
      description: "A counter app",
    },
    {
      id: "app2",
      title: "App 2",
      background: "#f1ffef",
      icon: undefined,
      description: "App 2",
    },
    {
      id: "app3",
      title: "App 3",
      background: "#f1ff3f",
      icon: undefined,
      description: "Yet another app",
    },
  ]);

  const [tsks, setTsks] = useState([]);

  useEffect(() => {
    console.log("TOKEN_FOR_ACC", accounts[0]);
    if (inProgress === InteractionStatus.None) {
      instance
        .acquireTokenSilent({ ...loginRequest, account: accounts[0] })
        .then((resp) => {
          console.log("API_TASK");
          getTasks(resp.accessToken)
            .then((axiosResp) => {
              setTsks(axiosResp.data);
            })
            .catch((axiosError) => {});
        })
        .catch((err) => {});
    }
  }, [instance, accounts, inProgress]);

  const getAppFromTaskId = (taskId) => {
    if (taskId === "app1") return <App1 />;
    if (taskId === "app2") return <App2 />;
    if (taskId === "app3") return <App3 />;
  };

  return (
    <>
      <div className="tasks-container flex flex-wrap p-6">
        {tasks.map((task, idx) => {
          return (
            <div
              className="task-card p-5 w-200px m-1"
              key={idx}
              onClick={() => props.chooseTab(getAppFromTaskId(task.id))}
              style={{ background: task.background || "#ffffff" }}
            >
              <div className="task-title text-base">{task.title}</div>
              <div className="task-description text-xs text-gray-800">
                {task.description}
              </div>
            </div>
          );
        })}
      </div>
      <>API Tasks count: {tsks.length}</>
    </>
  );
}
