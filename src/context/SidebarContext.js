import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(() => {
    const savedOpenState = localStorage.getItem("sidebarOpen");
    return savedOpenState === "true"; // 문자열을 boolean으로 변환
  });

  const toggleSidebar = () => {
    setOpen((prevOpen) => {
      const newOpenState = !prevOpen;
      localStorage.setItem("sidebarOpen", newOpenState); // 상태를 로컬 스토리지에 저장
      return newOpenState;
    });
  };

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
