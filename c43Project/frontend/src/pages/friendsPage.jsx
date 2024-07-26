import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import "./friendsPage.css";
import api from "../api";
const FriendsPage = () => {
  const [friendName, setFriendName] = useState("");
  const [friendList, setFriendList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [ourPendingList, setOurPendingList] = useState([]);
  const [user, setUser] = useState(null);
  const handleInputChange = (event) => {
    setFriendName(event.target.value);
  };
  const FindUser = async (username) => {
    try {
      console.log(username, "blashdhshs");
      const res = await api.get(`find-username/?username=${username}`);
      //const response = await api.get(`find-user/${username}`,  {
      //  method: "GET",});
      //alert(response.data)

      return res.data;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const user = await FindUser(friendName);
      console.log(user.username);
      setUser(user.username);
    } catch (error) {
      alert("no such user");
    }
  };

  const handleRemoveFriend = async (username) => {
    const response = await api.put(`remove-friends/${username}/`, {
      method: "PUT",
    });
    response && alert("friend removed");
  };

  const handleFriendReq = async () => {
    const friends = await api.post(`send-friend-request/${user}/`, {
      method: "POST",
    });
    friends.data.message === "duplicate friends"
      ? alert(`already friends with ${user} `)
      : alert(friends.data.message);
    setUser(null);
  };

  const getFriends = async () => {
    const friendList = await api.get("get-friends/", {
      method: "GET",
    });
    console.log(friendList.data.friends);
    friendList && setFriendList(friendList.data.friends);
  };

  const handleAddFriend = async (username) => {
    const res = await api.put(`accept-pending-req/${username}/`, {
      method: "PUT",
    });
    res && alert("request sent");
  };
  const getPendingReqs = async () => {
    const friendList = await api.get("get-pending-friends/", {
      method: "GET",
    });
    console.log("fndfnsfn", friendList.data);
    friendList && setPendingList(friendList.data);
  };

  const getOurPendingReqs = async () => {
    const friendList = await api.get("get_our_pending_requests/", {
      method: "GET",
    });
    friendList && setOurPendingList(friendList.data);
  };

  const removeSentReq = async (username) => {
    const res = await api.put(`remove_sentReq/${username}/`, { method: "PUT" });
    alert(res.data.message);
  };

  useEffect(() => {
    getFriends();
    getPendingReqs();
    getOurPendingReqs();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginLeft: "20px",
        }}
      >
        <h2 className="userh2">SEARCH FOR USER: </h2>
        <input
          type="text"
          placeholder="Enter username"
          value={friendName}
          onChange={handleInputChange}
        />
        <button className="userButton" onClick={handleSubmit}>
          SUBMIT
        </button>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginLeft: "210px",
          }}
        >
          <h2 className="userh2">{user}</h2>
          {user && (
            <button className="userButton" onClick={handleFriendReq}>
              SEND REQUEST
            </button>
          )}
        </div>
      </div>
      <div style={{ gap: "10px", marginLeft: "20px", marginTop: "50px" }}>
        <h2 className="userh2">FRIENDS</h2>
        <div>
          {friendList && friendList.length > 0 ? (
            friendList.map((friend) => (
              <div key={friend} style={{ display: "flex", gap: "10px" }}>
                <h2 className="userh2">{friend}</h2>
                <button
                  className="userButton"
                  onClick={() => handleRemoveFriend(friend)}
                >
                  Remove Friend
                </button>
              </div>
            ))
          ) : (
            <div>No Friends</div>
          )}
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          gap: "10px",
          marginLeft: "20px",
          marginTop: "50px",
        }}
      >
        <h2 className="userh2">PENDING REQUESTS</h2>
        <div>
          {pendingList && pendingList.length > 0 ? (
            pendingList.map((friend) => (
              <div key={friend.id} style={{ display: "flex", gap: "10px" }}>
                <h2 className="userh2">{friend.requester_username}</h2>
                <button
                  className="userButton"
                  onClick={() => handleAddFriend(friend.requester_username)}
                >
                  Add Friend
                </button>
                <button
                  className="userButton"
                  onClick={() => handleRemoveFriend(friend.requester_username)}
                >
                  Delete request
                </button>
              </div>
            ))
          ) : (
            <div>No Pending Requests</div>
          )}
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          gap: "10px",
          marginLeft: "20px",
          marginTop: "50px",
        }}
      >
        <h2 className="userh2">OUR SENT REQUESTS</h2>
        <div>
          {ourPendingList && ourPendingList.length > 0 ? (
            ourPendingList.map((friend) => (
              <div key={friend.id} style={{ display: "flex", gap: "10px" }}>
                <h2 className="userh2">{friend.receiver_username}</h2>
                <button
                  className="userButton"
                  onClick={() => removeSentReq(friend.receiver_username)}
                >
                  Delete Request
                </button>
              </div>
            ))
          ) : (
            <div>No sent Requests</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
