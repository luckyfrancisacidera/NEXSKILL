import Header from "@shared/components/Header";
import { Outlet } from "react-router-dom";
export default function HRLayout() {
  return (
    <>
      <Header></Header>
      <div className="container">
        <Outlet></Outlet>
      </div>
    </>
  );
}
