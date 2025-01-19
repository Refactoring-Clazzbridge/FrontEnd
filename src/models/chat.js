// UserProps 구조
const UserProps = {
  name: "", // string
  username: "", // string
  avatar: "", // string
  online: false, // boolean
};

// MessageProps 구조
const MessageProps = {
  id: "", // string
  content: "", // string
  timestamp: "", // string
  unread: false, // optional boolean
  sender: UserProps || "You", // UserProps 구조나 'You'
  attachment: {
    // optional attachment 구조
    fileName: "",
    type: "",
    size: "",
  },
};

// ChatProps 구조
const ChatProps = {
  id: "", // string
  sender: UserProps, // UserProps 구조
  messages: [MessageProps], // MessageProps 배열
};
