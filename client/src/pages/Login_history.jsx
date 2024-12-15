import axios from "axios/unsafe/axios.js";
import { default as Cookies } from "js-cookie";
import moment from "moment";
import React, { useEffect, useState } from "react";
import desktop from "../assets/desktop.jpg";
import ipad from "../assets/ipad.png";
import phone from "../assets/phone.jpg";
import { base_url } from "../util/config";
const Login_history = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  // const user_cookie = Cookie.get("user_token");
  const token = localStorage.getItem("user_token");

  const get_login_history = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/login/history`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoginHistory(data.login_history || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("user_token");
        Cookies.remove("user_token");
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    if (token) {
      get_login_history();
    } else {
      window.location.href = "/login";
    }
  }, [token]);
  const logout_single = async (id) => {
    try {
      const { data } = await axios.get(`${base_url}/api/user/logout/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      get_login_history();
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("user_token");
        window.location.href = "/login";
      }
    }
  };
  const logout_all = async (id) => {
    try {
      const { data } = await axios.get(`${base_url}/api/all-user/logout`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      get_login_history();
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("user_token");
        window.location.href = "/login";
      }
    }
  };
  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-slate-200">
      <div className="w-[80%] rounded-md bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Login History</h2>
          <button
            className="py-1 px-2 text-white bg-purple-500 rounded-md"
            onClick={logout_all}
          >
            Logout All session
          </button>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No
                </th>
                <th scope="col" className="px-6 py-3">
                  Ip
                </th>
                <th scope="col" className="px-6 py-3">
                  Device
                </th>
                <th scope="col" className="px-6 py-3">
                  Time
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((h, i) => (
                <tr
                  key={i}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4">{h.ip}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-start items-center gap-1">
                      {h.device_info?.type === "desktop" && (
                        <img
                          src={desktop}
                          className="w-[30px] h-[30px] rounded-sm"
                        />
                      )}
                      {h.device_info?.type === "tablet" && (
                        <img
                          src={ipad}
                          className="w-[30px] h-[30px] rounded-sm"
                        />
                      )}
                      {h.device_info?.type === "smartphone" && (
                        <img
                          src={phone}
                          className="w-[30px] h-[30px] rounded-sm"
                        />
                      )}
                      <span>
                        {h.device_info?.name} {h.device_info?.model}{" "}
                        {h.device_info?.browser}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {moment(Number(h.time)).format("LLLL")}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="border font-semibold px-2 py-1 rounded-md"
                      onClick={() => logout_single(h._id)}
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Login_history;
