import { Outlet } from "react-router-dom";
import { ScanInstance } from "./scanIstance";

export default function WhatsAppLayout() {
  return (
    <div className="p-4">
      {/* Aquí puedes poner tu navbar, sidebar o layout */}
      <Outlet /> <ScanInstance />
    </div>
  )};