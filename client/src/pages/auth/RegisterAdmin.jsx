import React from "react";
import { useNavigate } from "react-router-dom";
import AddPrincipalForm from "../../components/forms/AddPrincipalForm";

const RegisterAdmin = () => {
  const navigate = useNavigate();

  const finish = () => {
    navigate("/admin/dashboard");
  };

  return (
    <AddPrincipalForm
      mode="onboarding"
      allowSkip={true}
      onComplete={finish}
      onClose={finish}
    />
  );
};

export default RegisterAdmin;
