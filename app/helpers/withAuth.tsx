"use client";

import { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";

interface DecodedToken {
  role: string;
  [key: string]: any;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // console.log(token);
      const decoded = decodeToken(token);

      // console.log(decoded);

      if (!decoded) {
        router.push("/login");
        return;
      }

      if (decoded.role === "admin") {
        router.push("/adminDashboard");
      } else {
        router.push("/studentDashboard");
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
