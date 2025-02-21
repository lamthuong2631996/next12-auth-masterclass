"use client";

import { useCurrenRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import { FormError } from "../ui/form-error";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function RoleGate({ children, allowedRole }: RoleGateProps) {
  const role = useCurrenRole();
  if (role !== allowedRole) {
    return (
      <FormError message="You don't have permission to view this content!" />
    );
  }
  return (
    <>
        {children}
    </>
  )
}
